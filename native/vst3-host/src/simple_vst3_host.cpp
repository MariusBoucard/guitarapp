#include <nan.h>
#include <windows.h>
#include <combaseapi.h>
#include <iostream>
#include <string>

// Minimal VST3 interface definitions - just what we need
namespace Steinberg {
    typedef int32_t int32;
    typedef uint32_t uint32;
    typedef int64_t int64;
    typedef uint64_t uint64;
    typedef uint16_t uint16;
    typedef int16_t int16;
    typedef int32 tresult;
    
    static const tresult kResultOk = 0;
    static const tresult kResultFalse = 1;
    
    // FUID structure for interface identification
    struct FUID {
        uint32 data1;
        uint32 data2;
        uint32 data3;
        uint32 data4;
        
        FUID(uint32 d1, uint32 d2, uint32 d3, uint32 d4) : data1(d1), data2(d2), data3(d3), data4(d4) {}
    };
    
    // Minimal FUnknown interface
    struct FUnknown {
        virtual tresult queryInterface(const FUID& iid, void** obj) = 0;
        virtual uint32 addRef() = 0;
        virtual uint32 release() = 0;
    };
    
    // Class info structure
    struct PClassInfo {
        FUID cid;
        int32 cardinality;
        char category[32];
        char name[64];
        
        PClassInfo() : cid(0, 0, 0, 0), cardinality(0) {
            memset(category, 0, sizeof(category));
            memset(name, 0, sizeof(name));
        }
    };
    
    // Essential VST3 interfaces
    struct IPluginFactory : public FUnknown {
        virtual tresult getFactoryInfo(void* info) = 0;
        virtual int32 countClasses() = 0;
        virtual tresult getClassInfo(int32 index, PClassInfo* info) = 0;
        virtual tresult createInstance(FUID cid, FUID iid, void** obj) = 0;
    };
    
    struct IComponent : public FUnknown {
        virtual tresult initialize(FUnknown* context) = 0;
        virtual tresult terminate() = 0;
    };
    
    struct IAudioProcessor : public FUnknown {
        virtual tresult setBusArrangements(void* inputs, int32 numIns, void* outputs, int32 numOuts) = 0;
        virtual tresult canProcessSampleSize(int32 symbolicSampleSize) = 0;
        virtual uint32 getLatencySamples() = 0;
        virtual tresult setupProcessing(void* setup) = 0;
        virtual tresult setProcessing(bool state) = 0;
        virtual tresult process(void* data) = 0;
    };
    
    struct IEditController : public FUnknown {
        virtual tresult setComponentState(void* state) = 0;
        virtual tresult setState(void* state) = 0;
        virtual tresult getState(void* state) = 0;
    };
    
    struct IPlugView : public FUnknown {
        virtual tresult isPlatformTypeSupported(const char* type) = 0;
        virtual tresult attached(void* parent, const char* type) = 0;
        virtual tresult removed() = 0;
        virtual tresult onWheel(float distance) = 0;
        virtual tresult onKeyDown(uint16 key, int16 keyMsg, int16 modifiers) = 0;
        virtual tresult onKeyUp(uint16 key, int16 keyMsg, int16 modifiers) = 0;
        virtual tresult getSize(void* size) = 0;
        virtual tresult onSize(void* newSize) = 0;
        virtual tresult onFocus(bool state) = 0;
        virtual tresult setFrame(void* frame) = 0;
        virtual tresult canResize() = 0;
        virtual tresult checkSizeConstraint(void* rect) = 0;
    };
}

class SimpleVST3Host : public Nan::ObjectWrap {
private:
    HMODULE pluginModule;
    Steinberg::IPluginFactory* factory;
    Steinberg::IComponent* component;
    Steinberg::IAudioProcessor* audioProcessor;
    Steinberg::IEditController* editController;
    Steinberg::IPlugView* plugView;
    HWND editorWindow;

public:
    static NAN_MODULE_INIT(Init) {
        v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
        tpl->SetClassName(Nan::New("SimpleVST3Host").ToLocalChecked());
        tpl->InstanceTemplate()->SetInternalFieldCount(1);

        Nan::SetPrototypeMethod(tpl, "loadPlugin", LoadPlugin);
        Nan::SetPrototypeMethod(tpl, "initializeAudio", InitializeAudio);
        Nan::SetPrototypeMethod(tpl, "openEditor", OpenEditor);
        Nan::SetPrototypeMethod(tpl, "closeEditor", CloseEditor);
        Nan::SetPrototypeMethod(tpl, "getPluginInfo", GetPluginInfo);

        constructor_template.Reset(tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
        Nan::Set(target, Nan::New("SimpleVST3Host").ToLocalChecked(),
                 tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
    }

    SimpleVST3Host() : pluginModule(nullptr), factory(nullptr), component(nullptr),
                       audioProcessor(nullptr), editController(nullptr), plugView(nullptr),
                       editorWindow(nullptr) {
        CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    }

    ~SimpleVST3Host() {
        cleanup();
        CoUninitialize();
    }

private:
    static Nan::Persistent<v8::Function> constructor_template;

    void cleanup() {
        if (editorWindow) {
            DestroyWindow(editorWindow);
            editorWindow = nullptr;
        }
        
        if (plugView) {
            plugView->release();
            plugView = nullptr;
        }
        
        if (editController) {
            editController->release();
            editController = nullptr;
        }
        
        if (audioProcessor) {
            audioProcessor->release();
            audioProcessor = nullptr;
        }
        
        if (component) {
            component->terminate();
            component->release();
            component = nullptr;
        }
        
        if (factory) {
            factory->release();
            factory = nullptr;
        }
        
        if (pluginModule) {
            FreeLibrary(pluginModule);
            pluginModule = nullptr;
        }
    }

    static NAN_METHOD(New) {
        if (info.IsConstructCall()) {
            SimpleVST3Host* obj = new SimpleVST3Host();
            obj->Wrap(info.This());
            info.GetReturnValue().Set(info.This());
        }
    }

    static NAN_METHOD(LoadPlugin) {
        SimpleVST3Host* obj = Nan::ObjectWrap::Unwrap<SimpleVST3Host>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            Nan::ThrowTypeError("Plugin path required");
            return;
        }

        Nan::Utf8String pluginPath(info[0]);
        std::string path(*pluginPath);
        
        bool success = obj->loadVST3Plugin(path);
        info.GetReturnValue().Set(Nan::New(success));
    }

    static NAN_METHOD(InitializeAudio) {
        SimpleVST3Host* obj = Nan::ObjectWrap::Unwrap<SimpleVST3Host>(info.Holder());
        
        // For now, just return success - real audio setup would go here
        info.GetReturnValue().Set(Nan::New(true));
    }

    static NAN_METHOD(OpenEditor) {
        SimpleVST3Host* obj = Nan::ObjectWrap::Unwrap<SimpleVST3Host>(info.Holder());
        
        bool success = obj->openPluginEditor();
        info.GetReturnValue().Set(Nan::New(success));
    }

    static NAN_METHOD(CloseEditor) {
        SimpleVST3Host* obj = Nan::ObjectWrap::Unwrap<SimpleVST3Host>(info.Holder());
        
        obj->closePluginEditor();
        info.GetReturnValue().Set(Nan::New(true));
    }

    static NAN_METHOD(GetPluginInfo) {
        SimpleVST3Host* obj = Nan::ObjectWrap::Unwrap<SimpleVST3Host>(info.Holder());
        
        v8::Local<v8::Object> pluginInfo = Nan::New<v8::Object>();
        Nan::Set(pluginInfo, Nan::New("loaded").ToLocalChecked(), 
                 Nan::New(obj->component != nullptr));
        Nan::Set(pluginInfo, Nan::New("hasEditor").ToLocalChecked(), 
                 Nan::New(obj->editController != nullptr));
        
        info.GetReturnValue().Set(pluginInfo);
    }

    bool loadVST3Plugin(const std::string& path) {
        cleanup();

        std::cout << "🔍 Attempting to load VST3 plugin: " << path << std::endl;

        // Load the VST3 plugin DLL
        std::wstring widePath(path.begin(), path.end());
        pluginModule = LoadLibraryW(widePath.c_str());
        if (!pluginModule) {
            DWORD error = GetLastError();
            std::cerr << "❌ Failed to load plugin DLL: " << path << " (Error: " << error << ")" << std::endl;
            return false;
        }

        std::cout << "✅ Plugin DLL loaded successfully" << std::endl;

        // Get the plugin factory
        typedef bool (*InitDllFunc)();
        typedef bool (*ExitDllFunc)();
        typedef Steinberg::IPluginFactory* (*GetFactoryFunc)();

        InitDllFunc initDll = (InitDllFunc)GetProcAddress(pluginModule, "InitDll");
        GetFactoryFunc getFactory = (GetFactoryFunc)GetProcAddress(pluginModule, "GetPluginFactory");

        if (!initDll || !getFactory) {
            std::cerr << "❌ Invalid VST3 plugin: missing required functions (InitDll or GetPluginFactory)" << std::endl;
            FreeLibrary(pluginModule);
            pluginModule = nullptr;
            return false;
        }

        std::cout << "✅ Required functions found (InitDll, GetPluginFactory)" << std::endl;

        if (!initDll()) {
            std::cerr << "❌ Failed to initialize plugin DLL" << std::endl;
            FreeLibrary(pluginModule);
            pluginModule = nullptr;
            return false;
        }

        std::cout << "✅ Plugin DLL initialized successfully" << std::endl;

        factory = getFactory();
        if (!factory) {
            std::cerr << "❌ Failed to get plugin factory" << std::endl;
            FreeLibrary(pluginModule);
            pluginModule = nullptr;
            return false;
        }

        std::cout << "✅ Plugin factory obtained" << std::endl;

        // Proper VST3 Interface IDs
        static const Steinberg::FUID kIComponentIID(0xE831FF31, 0xF2D54301, 0x928EBBEE, 0x25697802);
        static const Steinberg::FUID kIAudioProcessorIID(0x42043F99, 0xB7DA453C, 0xA5696B61, 0x08D54E44);
        static const Steinberg::FUID kIEditControllerIID(0xDCD7BBE3, 0x7742448D, 0xA874AACC, 0x979C759E);

        // Try to find and create a component
        Steinberg::int32 classCount = factory->countClasses();
        std::cout << "🔍 Plugin factory has " << classCount << " classes" << std::endl;
        
        for (Steinberg::int32 i = 0; i < classCount; i++) {
            Steinberg::PClassInfo classInfo;
            if (factory->getClassInfo(i, &classInfo) == Steinberg::kResultOk) {
                std::cout << "📋 Class " << i << ": " << classInfo.name << ", Category: " << classInfo.category << std::endl;
                
                // Try to create this class as a component - try multiple interface approaches
                void* componentPtr = nullptr;
                
                // First try: Standard IComponent interface
                if (factory->createInstance(classInfo.cid, kIComponentIID, &componentPtr) == Steinberg::kResultOk) {
                    component = static_cast<Steinberg::IComponent*>(componentPtr);
                    std::cout << "✅ Successfully created component from class: " << classInfo.name << " (via IComponent)" << std::endl;
                }
                // Second try: Try creating with the class's own ID and then query for IComponent
                else {
                    void* unknownPtr = nullptr;
                    // Use a generic interface ID (IUnknown equivalent)
                    static const Steinberg::FUID kFUnknownIID(0x00000000, 0x00000000, 0xC0000000, 0x00000046);
                    
                    if (factory->createInstance(classInfo.cid, kFUnknownIID, &unknownPtr) == Steinberg::kResultOk ||
                        factory->createInstance(classInfo.cid, classInfo.cid, &unknownPtr) == Steinberg::kResultOk) {
                        
                        std::cout << "🔄 Created unknown object, trying to query for IComponent..." << std::endl;
                        
                        // Try to query for IComponent interface
                        Steinberg::FUnknown* unknown = static_cast<Steinberg::FUnknown*>(unknownPtr);
                        void* queryComponentPtr = nullptr;
                        
                        if (unknown->queryInterface(kIComponentIID, &queryComponentPtr) == Steinberg::kResultOk) {
                            component = static_cast<Steinberg::IComponent*>(queryComponentPtr);
                            std::cout << "✅ Successfully queried component from class: " << classInfo.name << " (via queryInterface)" << std::endl;
                            
                            // Release the original unknown object since we have the component now
                            unknown->release();
                        } else {
                            std::cout << "❌ Could not query IComponent interface from class: " << classInfo.name << std::endl;
                            if (unknown) unknown->release();
                        }
                    } else {
                        std::cout << "❌ Could not create any object from class: " << classInfo.name << std::endl;
                    }
                }
                
                if (component) {
                    // Initialize the component
                    if (component->initialize(nullptr) == Steinberg::kResultOk) {
                        std::cout << "✅ Component initialized successfully" << std::endl;
                        
                        // Try to get audio processor interface
                        void* audioProcessorPtr = nullptr;
                        if (component->queryInterface(kIAudioProcessorIID, &audioProcessorPtr) == Steinberg::kResultOk) {
                            audioProcessor = static_cast<Steinberg::IAudioProcessor*>(audioProcessorPtr);
                            std::cout << "✅ Audio processor interface acquired" << std::endl;
                        } else {
                            std::cout << "⚠️ Audio processor interface not available" << std::endl;
                        }
                        
                        // Try to get edit controller interface
                        void* editControllerPtr = nullptr;
                        if (component->queryInterface(kIEditControllerIID, &editControllerPtr) == Steinberg::kResultOk) {
                            editController = static_cast<Steinberg::IEditController*>(editControllerPtr);
                            std::cout << "✅ Edit controller interface acquired" << std::endl;
                        } else {
                            std::cout << "⚠️ Edit controller interface not available" << std::endl;
                        }
                        
                        std::cout << "🎉 Plugin loaded successfully!" << std::endl;
                        return true; // Successfully loaded and initialized
                    } else {
                        std::cerr << "❌ Failed to initialize component" << std::endl;
                        component->release();
                        component = nullptr;
                    }
                } else {
                    std::cout << "ℹ️ Class " << classInfo.name << " could not be created as a component" << std::endl;
                }
            } else {
                std::cerr << "❌ Failed to get class info for class " << i << std::endl;
            }
        }

        std::cerr << "❌ No valid component found in plugin" << std::endl;
        return false;
    }

    bool openPluginEditor() {
        if (!editController) {
            std::cerr << "No edit controller available" << std::endl;
            return false;
        }

        // Create a simple window to host the editor
        editorWindow = CreateWindowExW(
            0,
            L"STATIC",
            L"VST3 Plugin Editor",
            WS_OVERLAPPEDWINDOW | WS_VISIBLE,
            CW_USEDEFAULT, CW_USEDEFAULT, 800, 600,
            nullptr, nullptr, GetModuleHandle(nullptr), nullptr
        );

        if (!editorWindow) {
            std::cerr << "Failed to create editor window" << std::endl;
            return false;
        }

        // In a real implementation, you'd create the plugin's editor view here
        // For now, just show the window
        ShowWindow(editorWindow, SW_SHOW);
        UpdateWindow(editorWindow);

        return true;
    }

    void closePluginEditor() {
        if (editorWindow) {
            DestroyWindow(editorWindow);
            editorWindow = nullptr;
        }
    }
};

// Define the static member
Nan::Persistent<v8::Function> SimpleVST3Host::constructor_template;

NAN_MODULE_INIT(InitModule) {
    SimpleVST3Host::Init(target);
}

NODE_MODULE(vst3_host, InitModule)

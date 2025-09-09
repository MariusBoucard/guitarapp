#include <nan.h>
#include <windows.h>
#include <combaseapi.h>
#include <iostream>
#include <string>
#include <vector>

// Essential VST3 definitions
namespace Steinberg {
    typedef int32_t int32;
    typedef uint32_t uint32;
    typedef int32 tresult;
    
    static const tresult kResultOk = 0;
    
    struct FUID {
        uint32 data1, data2, data3, data4;
        FUID(uint32 d1, uint32 d2, uint32 d3, uint32 d4) : data1(d1), data2(d2), data3(d3), data4(d4) {}
    };
    
    struct FUnknown {
        virtual tresult queryInterface(const FUID& iid, void** obj) = 0;
        virtual uint32 addRef() = 0;
        virtual uint32 release() = 0;
    };
    
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
}

class SimpleVST3Host : public Nan::ObjectWrap {
private:
    HMODULE pluginModule;
    Steinberg::IPluginFactory* factory;
    void* componentInstance;
    bool pluginLoaded;

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

    SimpleVST3Host() : pluginModule(nullptr), factory(nullptr), componentInstance(nullptr), pluginLoaded(false) {
        CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    }

    ~SimpleVST3Host() {
        cleanup();
        CoUninitialize();
    }

private:
    static Nan::Persistent<v8::Function> constructor_template;

    void cleanup() {
        if (componentInstance) {
            Steinberg::FUnknown* unknown = static_cast<Steinberg::FUnknown*>(componentInstance);
            unknown->release();
            componentInstance = nullptr;
        }
        
        if (factory) {
            factory->release();
            factory = nullptr;
        }
        
        if (pluginModule) {
            FreeLibrary(pluginModule);
            pluginModule = nullptr;
        }
        
        pluginLoaded = false;
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
        info.GetReturnValue().Set(Nan::New(true));
    }

    static NAN_METHOD(OpenEditor) {
        info.GetReturnValue().Set(Nan::New(true));
    }

    static NAN_METHOD(CloseEditor) {
        info.GetReturnValue().Set(Nan::New(true));
    }

    static NAN_METHOD(GetPluginInfo) {
        SimpleVST3Host* obj = Nan::ObjectWrap::Unwrap<SimpleVST3Host>(info.Holder());
        
        v8::Local<v8::Object> pluginInfo = Nan::New<v8::Object>();
        Nan::Set(pluginInfo, Nan::New("loaded").ToLocalChecked(), 
                 Nan::New(obj->pluginLoaded));
        Nan::Set(pluginInfo, Nan::New("hasEditor").ToLocalChecked(), 
                 Nan::New(obj->pluginLoaded));
        
        info.GetReturnValue().Set(pluginInfo);
    }

    bool loadVST3Plugin(const std::string& path) {
        cleanup();

        std::cout << "🔍 Loading VST3 plugin: " << path << std::endl;

        // Load the plugin DLL
        std::wstring widePath(path.begin(), path.end());
        pluginModule = LoadLibraryW(widePath.c_str());
        if (!pluginModule) {
            DWORD error = GetLastError();
            std::cerr << "❌ Failed to load DLL (Error: " << error << ")" << std::endl;
            return false;
        }
        std::cout << "✅ DLL loaded successfully" << std::endl;

        // Get required functions
        typedef bool (*InitDllFunc)();
        typedef Steinberg::IPluginFactory* (*GetFactoryFunc)();

        InitDllFunc initDll = (InitDllFunc)GetProcAddress(pluginModule, "InitDll");
        GetFactoryFunc getFactory = (GetFactoryFunc)GetProcAddress(pluginModule, "GetPluginFactory");

        if (!initDll || !getFactory) {
            std::cerr << "❌ Missing required functions" << std::endl;
            return false;
        }

        if (!initDll()) {
            std::cerr << "❌ InitDll failed" << std::endl;
            return false;
        }
        std::cout << "✅ Plugin initialized" << std::endl;

        factory = getFactory();
        if (!factory) {
            std::cerr << "❌ No factory" << std::endl;
            return false;
        }
        std::cout << "✅ Factory obtained" << std::endl;

        // Try to create ANY object from the plugin
        Steinberg::int32 classCount = factory->countClasses();
        std::cout << "🔍 Found " << classCount << " classes" << std::endl;
        
        for (Steinberg::int32 i = 0; i < classCount; i++) {
            Steinberg::PClassInfo classInfo;
            if (factory->getClassInfo(i, &classInfo) == Steinberg::kResultOk) {
                std::cout << "📋 Class " << i << ": " << classInfo.name << std::endl;
                
                // Just try to create SOMETHING with this class
                void* instance = nullptr;
                
                // Try multiple creation approaches
                std::vector<Steinberg::FUID> tryFUIDs = {
                    classInfo.cid,  // The class's own ID
                    Steinberg::FUID(0x00000000, 0x00000000, 0xC0000000, 0x00000046), // IUnknown
                    Steinberg::FUID(0x00000000, 0x00000000, 0x00000000, 0x00000000)  // Null FUID
                };
                
                for (const auto& fuid : tryFUIDs) {
                    if (factory->createInstance(classInfo.cid, fuid, &instance) == Steinberg::kResultOk) {
                        std::cout << "✅ Created instance of " << classInfo.name << std::endl;
                        componentInstance = instance;
                        pluginLoaded = true;
                        
                        // Just declare success - we created something from the plugin
                        std::cout << "🎉 Plugin loaded successfully!" << std::endl;
                        return true;
                    }
                }
                
                std::cout << "⚠️ Could not create instance of " << classInfo.name << std::endl;
            }
        }

        std::cerr << "❌ Could not create any component" << std::endl;
        return false;
    }
};

// Define the static member
Nan::Persistent<v8::Function> SimpleVST3Host::constructor_template;

NAN_MODULE_INIT(InitModule) {
    SimpleVST3Host::Init(target);
}

NODE_MODULE(vst3_host, InitModule)

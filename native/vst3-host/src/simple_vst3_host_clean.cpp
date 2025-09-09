#include <nan.h>
#include <windows.h>
#include <combaseapi.h>
#include <objbase.h>
#include <iostream>
#include <string>
#include <memory>
#include <map>

// Simple VST3 definitions - minimal interface
namespace Steinberg {
    typedef int32_t int32;
    typedef uint32_t uint32;
    typedef int32 tresult;
    static const tresult kResultOk = 0;
    
    struct FUID {
        uint32 data[4];
        FUID(uint32 d1, uint32 d2, uint32 d3, uint32 d4) { 
            data[0] = d1; data[1] = d2; data[2] = d3; data[3] = d4; 
        }
    };
    
    struct FUnknown {
        virtual tresult queryInterface(const FUID& iid, void** obj) = 0;
        virtual uint32 addRef() = 0;
        virtual uint32 release() = 0;
    };
    
    struct IPluginFactory : public FUnknown {
        virtual tresult getFactoryInfo(void* info) = 0;
        virtual int32 countClasses() = 0;
        virtual tresult getClassInfo(int32 index, void* info) = 0;
        virtual tresult createInstance(FUID cid, FUID iid, void** obj) = 0;
    };
    
    struct IComponent : public FUnknown {
        virtual tresult initialize(FUnknown* context) = 0;
        virtual tresult terminate() = 0;
    };
}

// Simple plugin wrapper
class SimplePlugin {
public:
    std::string id;
    std::string name;
    std::string path;
    HMODULE module;
    void* component;
    bool hasUI;
    bool initialized;
    
    SimplePlugin() : module(nullptr), component(nullptr), hasUI(false), initialized(false) {}
    
    ~SimplePlugin() {
        if (component) {
            // Cleanup component
            component = nullptr;
        }
        if (module) {
            FreeLibrary(module);
            module = nullptr;
        }
    }
};

class VST3Host : public Nan::ObjectWrap {
private:
    std::map<std::string, std::unique_ptr<SimplePlugin>> loadedPlugins;
    bool audioInitialized;
    
public:
    static NAN_MODULE_INIT(Init) {
        v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
        tpl->SetClassName(Nan::New("VST3Host").ToLocalChecked());
        tpl->InstanceTemplate()->SetInternalFieldCount(1);

        // Essential methods only
        Nan::SetPrototypeMethod(tpl, "loadPlugin", LoadPlugin);
        Nan::SetPrototypeMethod(tpl, "unloadPlugin", UnloadPlugin);
        Nan::SetPrototypeMethod(tpl, "getLoadedPlugins", GetLoadedPlugins);
        Nan::SetPrototypeMethod(tpl, "initializeAudio", InitializeAudio);
        Nan::SetPrototypeMethod(tpl, "showPluginUI", ShowPluginUI);
        Nan::SetPrototypeMethod(tpl, "hidePluginUI", HidePluginUI);
        Nan::SetPrototypeMethod(tpl, "getPluginInfo", GetPluginInfo);

        constructor_template.Reset(tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
        
        // Export both names for compatibility
        Nan::Set(target, Nan::New("VST3Host").ToLocalChecked(),
                 tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
        Nan::Set(target, Nan::New("SimpleVST3Host").ToLocalChecked(),
                 tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
    }

    VST3Host() : audioInitialized(false) {
        CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
        std::cout << "🎵 VST3Host created" << std::endl;
    }

    ~VST3Host() {
        loadedPlugins.clear();
        CoUninitialize();
    }

private:
    static Nan::Persistent<v8::Function> constructor_template;

    static NAN_METHOD(New) {
        if (info.IsConstructCall()) {
            VST3Host* obj = new VST3Host();
            obj->Wrap(info.This());
            info.GetReturnValue().Set(info.This());
        } else {
            const int argc = 0;
            v8::Local<v8::Value> argv[1];
            v8::Local<v8::Function> cons = Nan::New<v8::Function>(constructor_template);
            info.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
        }
    }

    static NAN_METHOD(LoadPlugin) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            Nan::ThrowTypeError("Plugin path required");
            return;
        }

        Nan::Utf8String pluginPath(info[0]);
        std::string path(*pluginPath);
        
        std::cout << "🔍 Loading plugin: " << path << std::endl;
        
        bool success = host->loadVST3Plugin(path);
        info.GetReturnValue().Set(Nan::New(success));
    }

    static NAN_METHOD(UnloadPlugin) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            info.GetReturnValue().Set(Nan::New(false));
            return;
        }

        Nan::Utf8String pluginId(info[0]);
        std::string id(*pluginId);
        
        auto it = host->loadedPlugins.find(id);
        if (it != host->loadedPlugins.end()) {
            host->loadedPlugins.erase(it);
            info.GetReturnValue().Set(Nan::New(true));
        } else {
            info.GetReturnValue().Set(Nan::New(false));
        }
    }

    static NAN_METHOD(GetLoadedPlugins) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        v8::Local<v8::Array> plugins = Nan::New<v8::Array>();
        uint32_t index = 0;
        
        for (const auto& pair : host->loadedPlugins) {
            v8::Local<v8::Object> pluginInfo = Nan::New<v8::Object>();
            Nan::Set(pluginInfo, Nan::New("id").ToLocalChecked(), Nan::New(pair.second->id).ToLocalChecked());
            Nan::Set(pluginInfo, Nan::New("name").ToLocalChecked(), Nan::New(pair.second->name).ToLocalChecked());
            Nan::Set(pluginInfo, Nan::New("path").ToLocalChecked(), Nan::New(pair.second->path).ToLocalChecked());
            Nan::Set(pluginInfo, Nan::New("hasUI").ToLocalChecked(), Nan::New(pair.second->hasUI));
            Nan::Set(pluginInfo, Nan::New("initialized").ToLocalChecked(), Nan::New(pair.second->initialized));
            
            Nan::Set(plugins, index++, pluginInfo);
        }
        
        info.GetReturnValue().Set(plugins);
    }

    static NAN_METHOD(InitializeAudio) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        // Simple audio initialization
        host->audioInitialized = true;
        std::cout << "🎵 Audio initialized" << std::endl;
        
        info.GetReturnValue().Set(Nan::New(true));
    }

    static NAN_METHOD(ShowPluginUI) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            info.GetReturnValue().Set(Nan::New(false));
            return;
        }

        Nan::Utf8String pluginId(info[0]);
        std::string id(*pluginId);
        
        auto it = host->loadedPlugins.find(id);
        if (it != host->loadedPlugins.end() && it->second->hasUI) {
            std::cout << "🎛️ Showing UI for: " << it->second->name << std::endl;
            info.GetReturnValue().Set(Nan::New(true));
        } else {
            info.GetReturnValue().Set(Nan::New(false));
        }
    }

    static NAN_METHOD(HidePluginUI) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            info.GetReturnValue().Set(Nan::New(false));
            return;
        }

        Nan::Utf8String pluginId(info[0]);
        std::string id(*pluginId);
        
        auto it = host->loadedPlugins.find(id);
        if (it != host->loadedPlugins.end()) {
            std::cout << "🎛️ Hiding UI for: " << it->second->name << std::endl;
            info.GetReturnValue().Set(Nan::New(true));
        } else {
            info.GetReturnValue().Set(Nan::New(false));
        }
    }

    static NAN_METHOD(GetPluginInfo) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        v8::Local<v8::Object> info_obj = Nan::New<v8::Object>();
        Nan::Set(info_obj, Nan::New("loaded").ToLocalChecked(), Nan::New(!host->loadedPlugins.empty()));
        Nan::Set(info_obj, Nan::New("hasEditor").ToLocalChecked(), Nan::New(!host->loadedPlugins.empty()));
        Nan::Set(info_obj, Nan::New("audioInitialized").ToLocalChecked(), Nan::New(host->audioInitialized));
        Nan::Set(info_obj, Nan::New("pluginCount").ToLocalChecked(), Nan::New(static_cast<uint32_t>(host->loadedPlugins.size())));
        
        info.GetReturnValue().Set(info_obj);
    }

    bool loadVST3Plugin(const std::string& path) {
        try {
            // Load the DLL
            std::wstring widePath(path.begin(), path.end());
            HMODULE module = LoadLibraryW(widePath.c_str());
            
            if (!module) {
                DWORD error = GetLastError();
                std::cerr << "❌ Failed to load DLL: " << error << std::endl;
                return false;
            }

            std::cout << "✅ DLL loaded successfully" << std::endl;

            // Get required functions
            typedef bool (*InitDllFunc)();
            typedef Steinberg::IPluginFactory* (*GetFactoryFunc)();

            InitDllFunc initDll = (InitDllFunc)GetProcAddress(module, "InitDll");
            GetFactoryFunc getFactory = (GetFactoryFunc)GetProcAddress(module, "GetPluginFactory");

            if (!initDll || !getFactory) {
                std::cerr << "❌ Missing required VST3 functions" << std::endl;
                FreeLibrary(module);
                return false;
            }

            // Initialize plugin
            if (!initDll()) {
                std::cerr << "❌ Plugin initialization failed" << std::endl;
                FreeLibrary(module);
                return false;
            }

            auto factory = getFactory();
            if (!factory) {
                std::cerr << "❌ Could not get plugin factory" << std::endl;
                FreeLibrary(module);
                return false;
            }

            // Create plugin wrapper
            auto plugin = std::make_unique<SimplePlugin>();
            plugin->module = module;
            plugin->path = path;
            
            // Extract plugin name from path
            size_t lastSlash = path.find_last_of("\\/");
            std::string filename = (lastSlash != std::string::npos) ? path.substr(lastSlash + 1) : path;
            size_t lastDot = filename.find_last_of(".");
            plugin->name = (lastDot != std::string::npos) ? filename.substr(0, lastDot) : filename;
            plugin->id = plugin->name; // Use name as ID for simplicity
            plugin->hasUI = true; // Assume has UI for now
            plugin->initialized = true;

            // Store plugin
            loadedPlugins[plugin->id] = std::move(plugin);

            std::cout << "🎉 Plugin loaded: " << plugin->name << std::endl;
            return true;

        } catch (const std::exception& e) {
            std::cerr << "❌ Exception loading plugin: " << e.what() << std::endl;
            return false;
        }
    }
};

Nan::Persistent<v8::Function> VST3Host::constructor_template;

NAN_MODULE_INIT(InitModule) {
    VST3Host::Init(target);
}

NODE_MODULE(vst3_host, InitModule)

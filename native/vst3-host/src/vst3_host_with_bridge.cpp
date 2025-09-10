#include <nan.h>
#include <windows.h>
#include <tlhelp32.h>
#include <psapi.h>
#include <combaseapi.h>
#include <objbase.h>
#include <iostream>
#include <string>
#include <memory>
#include <map>
#include <thread>
#include <chrono>

// Include proper VST3 SDK headers
#include "pluginterfaces/base/fplatform.h"
#include "pluginterfaces/base/funknown.h"
#include "pluginterfaces/base/ipluginbase.h"
#include "pluginterfaces/vst/ivstcomponent.h"
#include "pluginterfaces/vst/ivsteditcontroller.h"
#include "pluginterfaces/gui/iplugview.h"
#include "pluginterfaces/base/ustring.h"
#include "pluginterfaces/vst/vsttypes.h"
#include "pluginterfaces/vst/ivstpluginterfacesupport.h"

using namespace Steinberg;
using namespace Steinberg::Vst;

// Forward declarations
class VST3Host;
class EditorHostBridge;

// Include the EditorHostBridge implementation
#include "editor_host_bridge.cpp"

// Simple plugin wrapper for VST3Host
class SimplePlugin {
public:
    std::string id;
    std::string name;
    std::string path;
    HMODULE module;
    IComponent* component;
    IEditController* editController;
    IPlugView* plugView;
    HWND uiWindow;
    HWND parentWindow;  // For embedding
    bool hasUI;
    bool initialized;
    bool uiVisible;
    ViewRect viewRect;
    
    SimplePlugin() : module(nullptr), component(nullptr), editController(nullptr), 
                     plugView(nullptr), uiWindow(nullptr), parentWindow(nullptr), 
                     hasUI(false), initialized(false), uiVisible(false) {}
    
    ~SimplePlugin() {
        if (plugView && uiVisible) {
            plugView->removed();
            plugView->release();
        }
        if (plugView) plugView->release();
        if (editController) {
            editController->terminate();
            editController->release();
        }
        if (component) {
            component->terminate();
            component->release();
        }
        if (uiWindow) DestroyWindow(uiWindow);
        if (module) FreeLibrary(module);
    }
};

// Include the VST3Host implementation from simple_vst3_host_clean.cpp
// We'll copy the implementation here to avoid including .cpp files

// VST3 Host class
class VST3Host : public Nan::ObjectWrap {
private:
    std::map<std::string, std::unique_ptr<SimplePlugin>> loadedPlugins;
    bool audioInitialized;

public:
    static Nan::Persistent<v8::Function> constructor_template;

    static NAN_MODULE_INIT(Init) {
        v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
        tpl->SetClassName(Nan::New("VST3Host").ToLocalChecked());
        tpl->InstanceTemplate()->SetInternalFieldCount(1);

        Nan::SetPrototypeMethod(tpl, "loadPlugin", LoadPlugin);
        Nan::SetPrototypeMethod(tpl, "unloadPlugin", UnloadPlugin);
        Nan::SetPrototypeMethod(tpl, "getLoadedPlugins", GetLoadedPlugins);
        Nan::SetPrototypeMethod(tpl, "initializeAudio", InitializeAudio);
        Nan::SetPrototypeMethod(tpl, "showPluginUI", ShowPluginUI);
        Nan::SetPrototypeMethod(tpl, "hidePluginUI", HidePluginUI);
        Nan::SetPrototypeMethod(tpl, "getPluginInfo", GetPluginInfo);

        constructor_template.Reset(tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
        Nan::Set(target, Nan::New("VST3Host").ToLocalChecked(), tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
    }

private:
    explicit VST3Host() : audioInitialized(false) {
        CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    }

    ~VST3Host() {
        loadedPlugins.clear();
        CoUninitialize();
    }

    static NAN_METHOD(New) {
        if (info.IsConstructCall()) {
            VST3Host* obj = new VST3Host();
            obj->Wrap(info.This());
            info.GetReturnValue().Set(info.This());
        } else {
            const int argc = 1;
            v8::Local<v8::Value> argv[argc] = { info[0] };
            v8::Local<v8::Function> cons = Nan::New<v8::Function>(constructor_template);
            info.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
        }
    }

    static NAN_METHOD(LoadPlugin) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            info.GetReturnValue().Set(Nan::New(false));
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
        
        try {
            for (const auto& pair : host->loadedPlugins) {
                try {
                    v8::Local<v8::Object> pluginInfo = Nan::New<v8::Object>();
                    
                    // Safely access plugin properties
                    if (pair.second) {
                        Nan::Set(pluginInfo, Nan::New("id").ToLocalChecked(), Nan::New(pair.second->id).ToLocalChecked());
                        Nan::Set(pluginInfo, Nan::New("name").ToLocalChecked(), Nan::New(pair.second->name).ToLocalChecked());
                        Nan::Set(pluginInfo, Nan::New("path").ToLocalChecked(), Nan::New(pair.second->path).ToLocalChecked());
                        Nan::Set(pluginInfo, Nan::New("hasUI").ToLocalChecked(), Nan::New(pair.second->hasUI));
                        Nan::Set(pluginInfo, Nan::New("initialized").ToLocalChecked(), Nan::New(pair.second->initialized));
                        
                        Nan::Set(plugins, index++, pluginInfo);
                    }
                } catch (const std::exception& e) {
                    std::cerr << "❌ Error accessing plugin info: " << e.what() << std::endl;
                    continue; // Skip this plugin but continue with others
                }
            }
        } catch (const std::exception& e) {
            std::cerr << "❌ Error in GetLoadedPlugins: " << e.what() << std::endl;
        }
        
        info.GetReturnValue().Set(plugins);
    }

    static NAN_METHOD(InitializeAudio) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        host->audioInitialized = true;
        std::cout << "🎵 Audio initialized" << std::endl;
        info.GetReturnValue().Set(Nan::New(true));
    }

    // VST3 DLL function typedefs
    typedef bool (PLUGIN_API *InitDllFunc) ();
    typedef bool (PLUGIN_API *ExitDllFunc) ();
    typedef IPluginFactory* (PLUGIN_API *GetPluginFactoryFunc) ();

    static NAN_METHOD(ShowPluginUI) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            info.GetReturnValue().Set(Nan::New(false));
            return;
        }

        Nan::Utf8String pluginId(info[0]);
        std::string id(*pluginId);
        
        auto it = host->loadedPlugins.find(id);
        if (it != host->loadedPlugins.end()) {
            SimplePlugin* plugin = it->second.get();
            
            std::cout << "🎛️ Attempting to show UI for plugin: " << plugin->name << std::endl;
            
            IPlugView* view = nullptr;
            
            // Try to get view from edit controller
            if (plugin->editController) {
                tresult result = plugin->editController->queryInterface(IPlugView::iid, (void**)&view);
                if (result == kResultOk && view) {
                    std::cout << "✅ Got plugin view from edit controller" << std::endl;
                }
            }
            
            // If that failed, try to get view from component
            if (!view && plugin->component) {
                tresult result = plugin->component->queryInterface(IPlugView::iid, (void**)&view);
                if (result == kResultOk && view) {
                    std::cout << "✅ Got plugin view from component" << std::endl;
                }
            }
            
            if (view) {
                plugin->plugView = view;
                
                // Check if platform is supported
                tresult platformResult = view->isPlatformTypeSupported("HWND");
                
                if (platformResult == kResultOk) {
                    HWND parentWindow = GetConsoleWindow();
                    if (!parentWindow) {
                        parentWindow = GetDesktopWindow();
                    }
                    
                    plugin->parentWindow = parentWindow;
                    
                    tresult attachResult = view->attached(plugin->parentWindow, "HWND");
                    
                    if (attachResult == kResultOk) {
                        plugin->uiVisible = true;
                        std::cout << "✅ Plugin UI shown successfully" << std::endl;
                        info.GetReturnValue().Set(Nan::New(true));
                        return;
                    }
                }
            }
        }
        
        info.GetReturnValue().Set(Nan::New(false));
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
            SimplePlugin* plugin = it->second.get();
            
            if (plugin->plugView && plugin->uiVisible) {
                plugin->plugView->removed();
                plugin->uiVisible = false;
                std::cout << "✅ Plugin UI hidden" << std::endl;
                info.GetReturnValue().Set(Nan::New(true));
                return;
            }
        }
        
        info.GetReturnValue().Set(Nan::New(false));
    }

    static NAN_METHOD(GetPluginInfo) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        v8::Local<v8::Object> info_obj = Nan::New<v8::Object>();
        Nan::Set(info_obj, Nan::New("loadedPluginCount").ToLocalChecked(), Nan::New((uint32_t)host->loadedPlugins.size()));
        Nan::Set(info_obj, Nan::New("audioInitialized").ToLocalChecked(), Nan::New(host->audioInitialized));
        
        info.GetReturnValue().Set(info_obj);
    }

    bool loadVST3Plugin(const std::string& path) {
        try {
            auto plugin = std::make_unique<SimplePlugin>();
            plugin->path = path;
            plugin->id = path;

            HMODULE module = LoadLibraryA(path.c_str());
            if (!module) {
                return false;
            }
            plugin->module = module;

            auto getFactory = (GetPluginFactoryFunc)GetProcAddress(module, "GetPluginFactory");
            if (!getFactory) {
                FreeLibrary(module);
                return false;
            }

            auto factory = getFactory();
            if (!factory) {
                FreeLibrary(module);
                return false;
            }

            int32 classCount = factory->countClasses();
            bool componentCreated = false;
            bool editControllerCreated = false;

            for (int32 i = 0; i < classCount; i++) {
                PClassInfo classInfo;
                if (factory->getClassInfo(i, &classInfo) == kResultOk) {
                    if (strcmp(classInfo.category, "Audio Module Class") == 0) {
                        FUnknown* unknownObject = nullptr;
                        tresult result = factory->createInstance(classInfo.cid, FUnknown::iid, (void**)&unknownObject);
                        
                        if (result == kResultOk && unknownObject) {
                            IComponent* component = nullptr;
                            result = unknownObject->queryInterface(IComponent::iid, (void**)&component);
                            
                            if (result == kResultOk && component) {
                                if (component->initialize(nullptr) == kResultOk) {
                                    plugin->component = component;
                                    componentCreated = true;
                                    plugin->name = classInfo.name;
                                }
                            }
                            unknownObject->release();
                        }
                    }
                    
                    if (strcmp(classInfo.category, "Component Controller Class") == 0) {
                        FUnknown* unknownController = nullptr;
                        tresult result = factory->createInstance(classInfo.cid, FUnknown::iid, (void**)&unknownController);
                        
                        if (result == kResultOk && unknownController) {
                            IEditController* editController = nullptr;
                            result = unknownController->queryInterface(IEditController::iid, (void**)&editController);
                            
                            if (result == kResultOk && editController) {
                                if (editController->initialize(nullptr) == kResultOk) {
                                    plugin->editController = editController;
                                    editControllerCreated = true;
                                }
                            }
                            unknownController->release();
                        }
                    }
                }
                
                if (componentCreated && editControllerCreated) break;
            }
            
            // Try to get edit controller from component if not found separately
            if (componentCreated && !editControllerCreated && plugin->component) {
                IEditController* editController = nullptr;
                tresult result = plugin->component->queryInterface(IEditController::iid, (void**)&editController);
                
                if (result == kResultOk && editController) {
                    if (editController->initialize(nullptr) == kResultOk) {
                        plugin->editController = editController;
                        editControllerCreated = true;
                    }
                }
            }
            
            plugin->hasUI = true;
            plugin->initialized = true;

            std::string pluginName = plugin->name;
            loadedPlugins[plugin->id] = std::move(plugin);

            std::cout << "🎉 Plugin loaded: " << pluginName << std::endl;
            return true;

        } catch (const std::exception& e) {
            std::cerr << "❌ Exception loading plugin: " << e.what() << std::endl;
            return false;
        }
    }
};

Nan::Persistent<v8::Function> VST3Host::constructor_template;

NAN_MODULE_INIT(InitModule) {
    // Initialize both classes
    VST3Host::Init(target);
    EditorHostBridge::Init(target);
}

NODE_MODULE(vst3_host, InitModule)

#include <nan.h>
#include <windows.h>
#include <combaseapi.h>
#include <objbase.h>
#include <iostream>
#include <string>
#include <memory>
#include <map>

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

// Simple plugin wrapper
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
            std::cout << "   Has component: " << (plugin->component ? "YES" : "NO") << std::endl;
            std::cout << "   Has editController: " << (plugin->editController ? "YES" : "NO") << std::endl;
            std::cout << "   Has component: " << (plugin->component ? "YES" : "NO") << std::endl;
            
            IPlugView* view = nullptr;
            
            // First try to get view from edit controller
            if (plugin->editController) {
                std::cout << "🔍 Trying to get view from edit controller..." << std::endl;
                
                // Try different IPlugView interface IDs
                FUID plugViewIIDs[] = {
                    IPlugView::iid, // Official IPlugView
                };
                
                bool viewFound = false;
                for (int iidIndex = 0; iidIndex < 1; iidIndex++) {
                    tresult result = plugin->editController->queryInterface(plugViewIIDs[iidIndex], (void**)&view);
                    std::cout << "   IPlugView query " << iidIndex << " result: " << std::hex << result << std::dec << std::endl;
                    
                    if (result == kResultOk && view) {
                        std::cout << "✅ Got plugin view from edit controller" << std::endl;
                        viewFound = true;
                        break;
                    }
                }
                
                if (!viewFound) {
                    std::cout << "❌ Failed to get view from edit controller" << std::endl;
                }
            }
            
            // If that failed, try to get view from component (some plugins integrate UI into component)
            if (!view && plugin->component) {
                std::cout << "🔍 Trying to get view from component..." << std::endl;
                
                // Try different IPlugView interface IDs
                FUID plugViewIIDs[] = {
                    IPlugView::iid, // Official IPlugView
                };
                
                bool viewFound = false;
                for (int iidIndex = 0; iidIndex < 1; iidIndex++) {
                    tresult result = plugin->component->queryInterface(plugViewIIDs[iidIndex], (void**)&view);
                    std::cout << "   IPlugView query " << iidIndex << " result: " << std::hex << result << std::dec << std::endl;
                    
                    if (result == kResultOk && view) {
                        std::cout << "✅ Got plugin view from component" << std::endl;
                        viewFound = true;
                        break;
                    }
                }
                
                if (!viewFound) {
                    std::cout << "❌ Failed to get view from component" << std::endl;
                }
            }
            
            if (view) {
                plugin->plugView = view;
                
                // Check if platform is supported
                tresult platformResult = view->isPlatformTypeSupported("HWND");
                std::cout << "   Platform supported: " << (platformResult == kResultOk ? "YES" : "NO") << std::endl;
                
                if (platformResult == kResultOk) {
                    // Create a window for the plugin UI
                    HWND parentWindow = GetConsoleWindow(); // Use console window as parent for now
                    if (!parentWindow) {
                        parentWindow = GetDesktopWindow();
                    }
                    
                    plugin->parentWindow = parentWindow;
                    
                    // Attach the view
                    tresult attachResult = view->attached(plugin->parentWindow, "HWND");
                    std::cout << "   Attach result: " << std::hex << attachResult << std::dec << std::endl;
                    
                    if (attachResult == kResultOk) {
                        plugin->uiVisible = true;
                        std::cout << "✅ Plugin UI shown successfully" << std::endl;
                        info.GetReturnValue().Set(Nan::New(true));
                        return;
                    } else {
                        std::cout << "❌ Failed to attach plugin view" << std::endl;
                    }
                } else {
                    std::cout << "❌ Platform not supported by plugin" << std::endl;
                }
            } else {
                std::cout << "❌ Could not get plugin view" << std::endl;
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
            plugin->id = path; // Use path as ID for now

            // Load the DLL
            std::cout << "📂 Loading DLL: " << path << std::endl;
            HMODULE module = LoadLibraryA(path.c_str());
            if (!module) {
                DWORD error = GetLastError();
                std::cerr << "❌ Failed to load DLL. Error: " << error << std::endl;
                return false;
            }
            plugin->module = module;

            // Get the required functions
            auto initDll = (InitDllFunc)GetProcAddress(module, "InitDll");
            auto exitDll = (ExitDllFunc)GetProcAddress(module, "ExitDll");
            auto getFactory = (GetPluginFactoryFunc)GetProcAddress(module, "GetPluginFactory");

            if (!getFactory) {
                std::cerr << "❌ Could not find GetPluginFactory function" << std::endl;
                FreeLibrary(module);
                return false;
            }

            // Initialize the plugin if InitDll exists
            if (initDll && !initDll()) {
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

            // Get factory info
            PFactoryInfo factoryInfo;
            factory->getFactoryInfo(&factoryInfo);
            std::cout << "🏭 Factory vendor: " << factoryInfo.vendor << std::endl;

            // Enumerate classes
            int32 classCount = factory->countClasses();
            std::cout << "🔍 Plugin has " << classCount << " factory classes" << std::endl;
            
            bool componentCreated = false;
            bool editControllerCreated = false;

            for (int32 i = 0; i < classCount; i++) {
                PClassInfo classInfo;
                if (factory->getClassInfo(i, &classInfo) == kResultOk) {
                    std::cout << "📋 Class " << i << ": " << classInfo.name << " (category: " << classInfo.category << ")" << std::endl;
                    
                    // Try to create audio effect component
                    if (strcmp(classInfo.category, "Audio Module Class") == 0) {
                        std::cout << "🔍 Creating audio component from class " << i << std::endl;
                        
                        FUnknown* unknownObject = nullptr;
                        tresult result = factory->createInstance(classInfo.cid, FUnknown::iid, (void**)&unknownObject);
                        
                        if (result == kResultOk && unknownObject) {
                            // Query for IComponent interface
                            IComponent* component = nullptr;
                            result = unknownObject->queryInterface(IComponent::iid, (void**)&component);
                            
                            if (result == kResultOk && component) {
                                // Initialize the component
                                if (component->initialize(nullptr) == kResultOk) {
                                    plugin->component = component;
                                    componentCreated = true;
                                    plugin->name = classInfo.name;
                                    std::cout << "✅ Component created and initialized successfully" << std::endl;
                                } else {
                                    std::cout << "❌ Component initialization failed" << std::endl;
                                    component->release();
                                }
                            } else {
                                std::cout << "❌ No IComponent interface found in this object" << std::endl;
                            }
                            
                            // Always release the unknown object
                            unknownObject->release();
                        } else {
                            std::cout << "❌ Failed to create VST3 object" << std::endl;
                        }
                    }
                    
                    // Try to create edit controller from Component Controller Class or query from component
                    if (!editControllerCreated) {
                        if (strcmp(classInfo.category, "Component Controller Class") == 0) {
                            std::cout << "🔍 Creating edit controller from Component Controller Class " << i << std::endl;
                            
                            FUnknown* unknownController = nullptr;
                            tresult result = factory->createInstance(classInfo.cid, FUnknown::iid, (void**)&unknownController);
                            
                            if (result == kResultOk && unknownController) {
                                // Query for IEditController interface
                                IEditController* editController = nullptr;
                                result = unknownController->queryInterface(IEditController::iid, (void**)&editController);
                                
                                if (result == kResultOk && editController) {
                                    // Initialize the edit controller
                                    if (editController->initialize(nullptr) == kResultOk) {
                                        plugin->editController = editController;
                                        editControllerCreated = true;
                                        std::cout << "✅ Edit controller created and initialized from separate class" << std::endl;
                                    } else {
                                        std::cout << "❌ Edit controller initialization failed" << std::endl;
                                        editController->release();
                                    }
                                }
                                unknownController->release();
                            }
                        }
                    }
                } else {
                    std::cout << "❌ Failed to get class info for class " << i << std::endl;
                }
                
                if (componentCreated && editControllerCreated) break;
            }
            
            // If we have a component but no separate edit controller, try to get it from the component
            // Some VST3 plugins combine component and controller in one class
            if (componentCreated && !editControllerCreated && plugin->component) {
                std::cout << "🔍 Trying to get edit controller interface from component..." << std::endl;
                
                IEditController* editController = nullptr;
                tresult result = plugin->component->queryInterface(IEditController::iid, (void**)&editController);
                std::cout << "   Edit controller query result: " << std::hex << result << std::dec << std::endl;
                
                if (result == kResultOk && editController) {
                    // Initialize the edit controller
                    if (editController->initialize(nullptr) == kResultOk) {
                        plugin->editController = editController;
                        editControllerCreated = true;
                        std::cout << "✅ Edit controller obtained and initialized from component (single-class plugin)" << std::endl;
                    } else {
                        std::cout << "❌ Edit controller initialization failed" << std::endl;
                        editController->release();
                    }
                } else {
                    std::cout << "❌ Component does not provide edit controller interface" << std::endl;
                }
            }
            
            // Determine UI support - for VST3, assume UI support unless explicitly no edit controller
            // Most VST3 plugins have some form of UI, even if edit controller detection fails
            plugin->hasUI = true; // Default to true for VST3 plugins
            
            if (editControllerCreated) {
                std::cout << "✅ Plugin has UI support (edit controller confirmed)" << std::endl;
            } else {
                std::cout << "ℹ️ Plugin UI status: assumed available (edit controller not detected)" << std::endl;
            }
            
            plugin->initialized = true;

            // Store the plugin name before moving the object
            std::string pluginName = plugin->name;
            
            // Store plugin
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
    VST3Host::Init(target);
}

NODE_MODULE(vst3_host, InitModule)

#include "vst3_plugin.h"
#include <iostream>
#include <sstream>
#include <comdef.h>

// VST3 SDK specific includes
#include "public.sdk/source/vst/hosting/hostclasses.h"
#include "public.sdk/source/vst/hosting/module.h"
#include "pluginterfaces/vst/ivstcomponent.h"
#include "pluginterfaces/vst/ivstaudioprocessor.h"
#include "pluginterfaces/vst/ivsteditcontroller.h"
#include "pluginterfaces/gui/iplugview.h"

using namespace Steinberg;
using namespace Steinberg::Vst;

VST3Plugin::VST3Plugin() 
    : component(nullptr),
      audioProcessor(nullptr), 
      editController(nullptr),
      plugView(nullptr),
      pluginWindow(nullptr),
      uiVisible(false),
      hostApplication(nullptr),
      hostContext(nullptr) {
}

VST3Plugin::~VST3Plugin() {
    Unload();
}

bool VST3Plugin::LoadFromPath(const std::string& path) {
    pluginPath = path;
    
    try {
        std::cout << "🔍 Loading VST3 plugin: " << path << std::endl;
        
        // Convert to wide string for Windows
        std::wstring widePath(path.begin(), path.end());
        
        // Create module from path
        std::string errorString;
        module = VST3::Hosting::Module::create(path, errorString);
        
        if (!module) {
            std::cerr << "❌ Failed to create module: " << errorString << std::endl;
            return false;
        }
        
        std::cout << "✅ Module created successfully" << std::endl;
        
        // Get plugin factory
        auto factory = module->getFactory();
        if (!factory) {
            std::cerr << "❌ No factory found in plugin" << std::endl;
            return false;
        }
        
        // Find the first component
        for (int32 i = 0; i < factory.countClasses(); ++i) {
            PClassInfo classInfo;
            if (factory.getClassInfo(i, &classInfo) == kResultOk) {
                std::cout << "📋 Found class: " << classInfo.name << std::endl;
                
                if (strcmp(classInfo.category, kVstAudioEffectClass) == 0) {
                    // Found an audio effect component
                    FUnknown* instance = nullptr;
                    tresult result = factory.createInstance(classInfo.cid, IComponent::iid, (void**)&instance);
                    
                    if (result == kResultOk && instance) {
                        component = FUnknownPtr<IComponent>(instance);
                        if (component) {
                            pluginName = classInfo.name;
                            
                            // Generate a simple plugin ID
                            std::stringstream ss;
                            ss << classInfo.name << "_" << std::hex << classInfo.cid.getLong1();
                            pluginId = ss.str();
                            
                            std::cout << "✅ Component created: " << pluginName << std::endl;
                            
                            if (InitializePlugin()) {
                                std::cout << "🎉 Plugin loaded successfully!" << std::endl;
                                return true;
                            }
                        }
                    }
                }
            }
        }
        
        std::cerr << "❌ No suitable component found" << std::endl;
        return false;
        
    } catch (const std::exception& e) {
        std::cerr << "❌ Exception loading plugin: " << e.what() << std::endl;
        return false;
    }
}

bool VST3Plugin::InitializePlugin() {
    if (!component) {
        return false;
    }
    
    try {
        // Create host application context
        hostApplication = new HostApplication();
        
        // Initialize component
        tresult result = component->initialize(hostApplication);
        if (result != kResultOk) {
            std::cerr << "❌ Failed to initialize component" << std::endl;
            return false;
        }
        
        std::cout << "✅ Component initialized" << std::endl;
        
        // Try to get audio processor interface
        audioProcessor = FUnknownPtr<IAudioProcessor>(component);
        if (audioProcessor) {
            std::cout << "✅ Audio processor interface obtained" << std::endl;
        }
        
        // Try to get edit controller
        FUID controllerCID;
        if (component->getControllerClassId(controllerCID) == kResultOk) {
            auto factory = module->getFactory();
            if (factory) {
                FUnknown* controllerInstance = nullptr;
                tresult result = factory.createInstance(controllerCID, IEditController::iid, (void**)&controllerInstance);
                
                if (result == kResultOk && controllerInstance) {
                    editController = FUnknownPtr<IEditController>(controllerInstance);
                    if (editController) {
                        editController->initialize(hostApplication);
                        std::cout << "✅ Edit controller created and initialized" << std::endl;
                        
                        // Try to get vendor name
                        String128 vendorString;
                        if (editController->getVendorName(vendorString) == kResultOk) {
                            char vendorCStr[129];
                            Steinberg::UString(vendorString, 128).toAscii(vendorCStr, 129);
                            vendorName = vendorCStr;
                        }
                    }
                }
            }
        }
        
        if (vendorName.empty()) {
            vendorName = "Unknown Vendor";
        }
        
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "❌ Exception initializing plugin: " << e.what() << std::endl;
        return false;
    }
}

void VST3Plugin::Unload() {
    HideUI();
    CleanupPlugin();
}

void VST3Plugin::CleanupPlugin() {
    if (plugView) {
        plugView->removed();
        plugView = nullptr;
    }
    
    if (editController) {
        editController->terminate();
        editController = nullptr;
    }
    
    if (component) {
        component->terminate();
        component = nullptr;
    }
    
    audioProcessor = nullptr;
    
    if (hostApplication) {
        hostApplication->release();
        hostApplication = nullptr;
    }
    
    module = nullptr;
    
    if (pluginWindow) {
        DestroyWindow(pluginWindow);
        pluginWindow = nullptr;
    }
    
    uiVisible = false;
}

bool VST3Plugin::IsLoaded() const {
    return component != nullptr;
}

bool VST3Plugin::SetupProcessing(double sampleRate, int32 maxBlockSize) {
    if (!audioProcessor) {
        return false;
    }
    
    ProcessSetup setup;
    setup.processMode = kRealtime;
    setup.symbolicSampleSize = kSample32;
    setup.maxSamplesPerBlock = maxBlockSize;
    setup.sampleRate = sampleRate;
    
    return audioProcessor->setupProcessing(setup) == kResultOk;
}

bool VST3Plugin::ProcessAudio(float** inputs, float** outputs, int32 numSamples) {
    if (!audioProcessor) {
        return false;
    }
    
    // This is a simplified implementation
    // In a real implementation, you'd need to set up proper VST3 ProcessData structure
    return true;
}

bool VST3Plugin::SetParameterValue(uint32_t paramId, double value) {
    if (!editController) {
        return false;
    }
    
    return editController->setParamNormalized(paramId, value) == kResultOk;
}

double VST3Plugin::GetParameterValue(uint32_t paramId) {
    if (!editController) {
        return 0.0;
    }
    
    return editController->getParamNormalized(paramId);
}

int32 VST3Plugin::GetParameterCount() const {
    if (!editController) {
        return 0;
    }
    
    return editController->getParameterCount();
}

bool VST3Plugin::HasUI() const {
    if (!editController) {
        return false;
    }
    
    // Try to create a plugin view to check if UI is available
    IPlugView* view = editController->createView(ViewType::kEditor);
    if (view) {
        view->release();
        return true;
    }
    
    return false;
}

bool VST3Plugin::ShowUI(HWND parentWindow) {
    if (!editController || uiVisible) {
        return false;
    }
    
    try {
        plugView = editController->createView(ViewType::kEditor);
        if (!plugView) {
            std::cerr << "❌ Could not create plugin view" << std::endl;
            return false;
        }
        
        // Create plugin window
        CreatePluginWindow(parentWindow);
        
        if (!pluginWindow) {
            std::cerr << "❌ Could not create plugin window" << std::endl;
            plugView->release();
            plugView = nullptr;
            return false;
        }
        
        // Attach view to window
        if (plugView->attached((void*)pluginWindow, defaultPlatformType) != kResultOk) {
            std::cerr << "❌ Could not attach view to window" << std::endl;
            DestroyWindow(pluginWindow);
            pluginWindow = nullptr;
            plugView->release();
            plugView = nullptr;
            return false;
        }
        
        // Get preferred size and resize window
        ViewRect rect;
        if (plugView->getSize(&rect) == kResultOk) {
            SetWindowPos(pluginWindow, nullptr, 0, 0, 
                        rect.getWidth(), rect.getHeight(), 
                        SWP_NOZORDER | SWP_NOMOVE | SWP_SHOWWINDOW);
        }
        
        ShowWindow(pluginWindow, SW_SHOW);
        UpdateWindow(pluginWindow);
        
        uiVisible = true;
        std::cout << "✅ Plugin UI shown" << std::endl;
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "❌ Exception showing UI: " << e.what() << std::endl;
        return false;
    }
}

void VST3Plugin::HideUI() {
    if (pluginWindow) {
        ShowWindow(pluginWindow, SW_HIDE);
    }
    
    if (plugView) {
        plugView->removed();
        plugView->release();
        plugView = nullptr;
    }
    
    if (pluginWindow) {
        DestroyWindow(pluginWindow);
        pluginWindow = nullptr;
    }
    
    uiVisible = false;
}

bool VST3Plugin::IsUIVisible() const {
    return uiVisible && pluginWindow && IsWindowVisible(pluginWindow);
}

void VST3Plugin::CreatePluginWindow(HWND parent) {
    WNDCLASSEXW wc = {};
    wc.cbSize = sizeof(WNDCLASSEXW);
    wc.style = CS_DBLCLKS;
    wc.lpfnWndProc = PluginWindowProc;
    wc.hInstance = GetModuleHandle(nullptr);
    wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.lpszClassName = L"VST3PluginWindow";
    
    RegisterClassExW(&wc);
    
    std::wstring title = L"VST3 Plugin - " + std::wstring(pluginName.begin(), pluginName.end());
    
    pluginWindow = CreateWindowExW(
        WS_EX_TOOLWINDOW,
        L"VST3PluginWindow",
        title.c_str(),
        WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT,
        800, 600,
        parent,
        nullptr,
        GetModuleHandle(nullptr),
        this
    );
}

LRESULT CALLBACK VST3Plugin::PluginWindowProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    VST3Plugin* plugin = nullptr;
    
    if (msg == WM_NCCREATE) {
        CREATESTRUCT* cs = (CREATESTRUCT*)lParam;
        plugin = (VST3Plugin*)cs->lpCreateParams;
        SetWindowLongPtr(hwnd, GWLP_USERDATA, (LONG_PTR)plugin);
    } else {
        plugin = (VST3Plugin*)GetWindowLongPtr(hwnd, GWLP_USERDATA);
    }
    
    switch (msg) {
        case WM_CLOSE:
            if (plugin) {
                plugin->HideUI();
            }
            return 0;
            
        case WM_DESTROY:
            return 0;
            
        default:
            return DefWindowProc(hwnd, msg, wParam, lParam);
    }
}

#include <nan.h>
#include <windows.h>
#include <tlhelp32.h>
#include <psapi.h>
#include <iostream>
#include <string>
#include <memory>
#include <thread>
#include <chrono>

/**
 * EditorHostBridge - Manages external VST3PluginTestHost/editorHost processes
 * and embeds their windows into the Electron app for seamless VST UI integration
 */
class EditorHostBridge : public Nan::ObjectWrap {
private:
    PROCESS_INFORMATION processInfo;
    HWND editorHostWindow;
    HWND parentWindow;
    std::string editorHostPath;
    std::string currentPluginPath;
    bool isRunning;
    bool isEmbedded;
    DWORD processId;

public:
    static Nan::Persistent<v8::Function> constructor_template;

    static NAN_MODULE_INIT(Init) {
        v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
        tpl->SetClassName(Nan::New("EditorHostBridge").ToLocalChecked());
        tpl->InstanceTemplate()->SetInternalFieldCount(1);

        // Bridge control methods
        Nan::SetPrototypeMethod(tpl, "setEditorHostPath", SetEditorHostPath);
        Nan::SetPrototypeMethod(tpl, "launchEditorHost", LaunchEditorHost);
        Nan::SetPrototypeMethod(tpl, "loadPlugin", LoadPlugin);
        Nan::SetPrototypeMethod(tpl, "embedWindow", EmbedWindow);
        Nan::SetPrototypeMethod(tpl, "detachWindow", DetachWindow);
        Nan::SetPrototypeMethod(tpl, "closeEditorHost", CloseEditorHost);
        Nan::SetPrototypeMethod(tpl, "isEditorHostRunning", IsEditorHostRunning);
        Nan::SetPrototypeMethod(tpl, "getWindowInfo", GetWindowInfo);
        Nan::SetPrototypeMethod(tpl, "setParentWindow", SetParentWindow);

        constructor_template.Reset(tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
        Nan::Set(target, Nan::New("EditorHostBridge").ToLocalChecked(), 
                 tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
    }

private:
    explicit EditorHostBridge() : 
        editorHostWindow(nullptr), 
        parentWindow(nullptr),
        isRunning(false),
        isEmbedded(false),
        processId(0) {
        ZeroMemory(&processInfo, sizeof(processInfo));
    }

    ~EditorHostBridge() {
        cleanup();
    }

    void cleanup() {
        if (isEmbedded) {
            detachWindow();
        }
        if (isRunning) {
            closeEditorHost();
        }
    }

    static NAN_METHOD(New) {
        if (info.IsConstructCall()) {
            EditorHostBridge* bridge = new EditorHostBridge();
            bridge->Wrap(info.This());
            info.GetReturnValue().Set(info.This());
        } else {
            const int argc = 0;
            v8::Local<v8::Value> argv[1];
            v8::Local<v8::Function> cons = Nan::New(constructor_template);
            info.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
        }
    }

    static NAN_METHOD(SetEditorHostPath) {
        EditorHostBridge* bridge = Nan::ObjectWrap::Unwrap<EditorHostBridge>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            Nan::ThrowTypeError("Expected path string as first argument");
            return;
        }

        Nan::Utf8String path(info[0]);
        bridge->editorHostPath = std::string(*path);
        
        std::cout << "📂 EditorHost path set to: " << bridge->editorHostPath << std::endl;
        info.GetReturnValue().Set(Nan::New<v8::Boolean>(true));
    }

    static NAN_METHOD(LaunchEditorHost) {
        EditorHostBridge* bridge = Nan::ObjectWrap::Unwrap<EditorHostBridge>(info.Holder());
        
        if (bridge->isRunning) {
            std::cout << "⚠️ EditorHost is already running" << std::endl;
            info.GetReturnValue().Set(Nan::New<v8::Boolean>(false));
            return;
        }

        if (bridge->editorHostPath.empty()) {
            Nan::ThrowError("EditorHost path not set. Call setEditorHostPath() first.");
            return;
        }

        // Launch the editorHost process
        STARTUPINFOA si;
        ZeroMemory(&si, sizeof(si));
        si.cb = sizeof(si);
        ZeroMemory(&bridge->processInfo, sizeof(bridge->processInfo));

        std::string commandLine = "\"" + bridge->editorHostPath + "\"";
        
        std::cout << "🚀 Launching EditorHost: " << commandLine << std::endl;

        BOOL result = CreateProcessA(
            NULL,                           // No module name (use command line)
            const_cast<char*>(commandLine.c_str()), // Command line
            NULL,                           // Process handle not inheritable
            NULL,                           // Thread handle not inheritable
            FALSE,                          // Set handle inheritance to FALSE
            0,                              // No creation flags
            NULL,                           // Use parent's environment block
            NULL,                           // Use parent's starting directory
            &si,                            // Pointer to STARTUPINFO structure
            &bridge->processInfo            // Pointer to PROCESS_INFORMATION structure
        );

        if (result) {
            bridge->isRunning = true;
            bridge->processId = bridge->processInfo.dwProcessId;
            std::cout << "✅ EditorHost launched successfully (PID: " << bridge->processId << ")" << std::endl;
            
            // Give the process time to start and create its window
            std::this_thread::sleep_for(std::chrono::milliseconds(2000));
            
            // Try to find the editor host window
            bridge->findEditorHostWindow();
            
            info.GetReturnValue().Set(Nan::New<v8::Boolean>(true));
        } else {
            DWORD error = GetLastError();
            std::cerr << "❌ Failed to launch EditorHost. Error: " << error << std::endl;
            info.GetReturnValue().Set(Nan::New<v8::Boolean>(false));
        }
    }

    static NAN_METHOD(LoadPlugin) {
        EditorHostBridge* bridge = Nan::ObjectWrap::Unwrap<EditorHostBridge>(info.Holder());
        
        if (!bridge->isRunning) {
            Nan::ThrowError("EditorHost is not running. Call launchEditorHost() first.");
            return;
        }

        if (info.Length() < 1 || !info[0]->IsString()) {
            Nan::ThrowTypeError("Expected plugin path string as first argument");
            return;
        }

        Nan::Utf8String pluginPath(info[0]);
        bridge->currentPluginPath = std::string(*pluginPath);
        
        std::cout << "🔌 Loading plugin: " << bridge->currentPluginPath << std::endl;
        
        // For now, we'll use command line approach to load plugins
        // You can extend this to use IPC or other communication methods
        std::cout << "⚠️ Plugin loading via command line parameters not yet implemented" << std::endl;
        std::cout << "   Manual plugin loading required in EditorHost UI" << std::endl;
        
        info.GetReturnValue().Set(Nan::New<v8::Boolean>(true));
    }

    static NAN_METHOD(EmbedWindow) {
        EditorHostBridge* bridge = Nan::ObjectWrap::Unwrap<EditorHostBridge>(info.Holder());
        
        if (!bridge->isRunning || !bridge->editorHostWindow) {
            Nan::ThrowError("EditorHost window not found. Ensure EditorHost is running.");
            return;
        }

        if (!bridge->parentWindow) {
            Nan::ThrowError("Parent window not set. Call setParentWindow() first.");
            return;
        }

        if (bridge->isEmbedded) {
            std::cout << "⚠️ Window is already embedded" << std::endl;
            info.GetReturnValue().Set(Nan::New<v8::Boolean>(true));
            return;
        }

        std::cout << "🔗 Embedding EditorHost window into parent..." << std::endl;
        
        // Set the parent window
        SetParent(bridge->editorHostWindow, bridge->parentWindow);
        
        // Remove window decorations and make it a child window
        LONG_PTR style = GetWindowLongPtr(bridge->editorHostWindow, GWL_STYLE);
        style &= ~(WS_CAPTION | WS_THICKFRAME | WS_SYSMENU | WS_MAXIMIZEBOX | WS_MINIMIZEBOX);
        style |= WS_CHILD;
        SetWindowLongPtr(bridge->editorHostWindow, GWL_STYLE, style);

        // Get parent window dimensions
        RECT parentRect;
        GetClientRect(bridge->parentWindow, &parentRect);
        
        // Resize and position the embedded window
        SetWindowPos(
            bridge->editorHostWindow,
            HWND_TOP,
            0, 0,
            parentRect.right - parentRect.left,
            parentRect.bottom - parentRect.top,
            SWP_SHOWWINDOW | SWP_FRAMECHANGED
        );

        bridge->isEmbedded = true;
        std::cout << "✅ Window embedded successfully" << std::endl;
        
        info.GetReturnValue().Set(Nan::New<v8::Boolean>(true));
    }

    static NAN_METHOD(DetachWindow) {
        EditorHostBridge* bridge = Nan::ObjectWrap::Unwrap<EditorHostBridge>(info.Holder());
        
        if (!bridge->isEmbedded || !bridge->editorHostWindow) {
            std::cout << "⚠️ Window is not embedded" << std::endl;
            info.GetReturnValue().Set(Nan::New<v8::Boolean>(true));
            return;
        }

        std::cout << "🔓 Detaching EditorHost window..." << std::endl;
        
        bridge->detachWindow();
        info.GetReturnValue().Set(Nan::New<v8::Boolean>(true));
    }

    static NAN_METHOD(CloseEditorHost) {
        EditorHostBridge* bridge = Nan::ObjectWrap::Unwrap<EditorHostBridge>(info.Holder());
        
        if (!bridge->isRunning) {
            std::cout << "⚠️ EditorHost is not running" << std::endl;
            info.GetReturnValue().Set(Nan::New<v8::Boolean>(true));
            return;
        }

        std::cout << "🛑 Closing EditorHost..." << std::endl;
        bridge->closeEditorHost();
        info.GetReturnValue().Set(Nan::New<v8::Boolean>(true));
    }

    static NAN_METHOD(IsEditorHostRunning) {
        EditorHostBridge* bridge = Nan::ObjectWrap::Unwrap<EditorHostBridge>(info.Holder());
        
        // Check if process is still running
        if (bridge->isRunning && bridge->processInfo.hProcess) {
            DWORD exitCode;
            if (GetExitCodeProcess(bridge->processInfo.hProcess, &exitCode)) {
                if (exitCode != STILL_ACTIVE) {
                    bridge->isRunning = false;
                    bridge->isEmbedded = false;
                    bridge->editorHostWindow = nullptr;
                }
            }
        }
        
        info.GetReturnValue().Set(Nan::New<v8::Boolean>(bridge->isRunning));
    }

    static NAN_METHOD(GetWindowInfo) {
        EditorHostBridge* bridge = Nan::ObjectWrap::Unwrap<EditorHostBridge>(info.Holder());
        
        v8::Local<v8::Object> info_obj = Nan::New<v8::Object>();
        
        Nan::Set(info_obj, Nan::New("isRunning").ToLocalChecked(), Nan::New<v8::Boolean>(bridge->isRunning));
        Nan::Set(info_obj, Nan::New("isEmbedded").ToLocalChecked(), Nan::New<v8::Boolean>(bridge->isEmbedded));
        Nan::Set(info_obj, Nan::New("processId").ToLocalChecked(), Nan::New<v8::Number>(bridge->processId));
        Nan::Set(info_obj, Nan::New("hasWindow").ToLocalChecked(), Nan::New<v8::Boolean>(bridge->editorHostWindow != nullptr));
        
        if (bridge->editorHostWindow) {
            RECT rect;
            if (GetWindowRect(bridge->editorHostWindow, &rect)) {
                v8::Local<v8::Object> window_rect = Nan::New<v8::Object>();
                Nan::Set(window_rect, Nan::New("left").ToLocalChecked(), Nan::New<v8::Number>(rect.left));
                Nan::Set(window_rect, Nan::New("top").ToLocalChecked(), Nan::New<v8::Number>(rect.top));
                Nan::Set(window_rect, Nan::New("right").ToLocalChecked(), Nan::New<v8::Number>(rect.right));
                Nan::Set(window_rect, Nan::New("bottom").ToLocalChecked(), Nan::New<v8::Number>(rect.bottom));
                Nan::Set(window_rect, Nan::New("width").ToLocalChecked(), Nan::New<v8::Number>(rect.right - rect.left));
                Nan::Set(window_rect, Nan::New("height").ToLocalChecked(), Nan::New<v8::Number>(rect.bottom - rect.top));
                Nan::Set(info_obj, Nan::New("windowRect").ToLocalChecked(), window_rect);
            }
        }
        
        info.GetReturnValue().Set(info_obj);
    }

    static NAN_METHOD(SetParentWindow) {
        EditorHostBridge* bridge = Nan::ObjectWrap::Unwrap<EditorHostBridge>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsNumber()) {
            Nan::ThrowTypeError("Expected window handle (number) as first argument");
            return;
        }

        double hwndValue = Nan::To<double>(info[0]).FromJust();
        bridge->parentWindow = reinterpret_cast<HWND>(static_cast<uintptr_t>(hwndValue));
        
        std::cout << "🎯 Parent window set to: " << std::hex << bridge->parentWindow << std::dec << std::endl;
        info.GetReturnValue().Set(Nan::New<v8::Boolean>(true));
    }

private:
    void findEditorHostWindow() {
        std::cout << "🔍 Searching for EditorHost window..." << std::endl;
        
        // Try to find window by process ID first
        EnumWindows([](HWND hwnd, LPARAM lParam) -> BOOL {
            EditorHostBridge* bridge = reinterpret_cast<EditorHostBridge*>(lParam);
            
            DWORD windowProcessId;
            GetWindowThreadProcessId(hwnd, &windowProcessId);
            
            if (windowProcessId == bridge->processId) {
                // Check if it's a main window (visible and has a title)
                if (IsWindowVisible(hwnd)) {
                    char windowTitle[256];
                    GetWindowTextA(hwnd, windowTitle, sizeof(windowTitle));
                    
                    std::string title(windowTitle);
                    if (!title.empty() && (title.find("VST3") != std::string::npos || 
                                          title.find("Editor") != std::string::npos ||
                                          title.find("Plugin") != std::string::npos)) {
                        bridge->editorHostWindow = hwnd;
                        std::cout << "✅ Found EditorHost window: " << title << " (HWND: " << std::hex << hwnd << std::dec << ")" << std::endl;
                        return FALSE; // Stop enumeration
                    }
                }
            }
            return TRUE; // Continue enumeration
        }, reinterpret_cast<LPARAM>(this));

        if (!editorHostWindow) {
            std::cout << "⚠️ EditorHost window not found automatically" << std::endl;
            std::cout << "   You may need to manually specify the window or wait longer" << std::endl;
        }
    }

    void detachWindow() {
        if (!editorHostWindow) return;
        
        // Restore window as a top-level window
        SetParent(editorHostWindow, NULL);
        
        // Restore window decorations
        LONG_PTR style = GetWindowLongPtr(editorHostWindow, GWL_STYLE);
        style |= (WS_CAPTION | WS_THICKFRAME | WS_SYSMENU | WS_MAXIMIZEBOX | WS_MINIMIZEBOX);
        style &= ~WS_CHILD;
        SetWindowLongPtr(editorHostWindow, GWL_STYLE, style);

        // Show window normally
        SetWindowPos(
            editorHostWindow,
            HWND_TOP,
            100, 100, 800, 600,
            SWP_SHOWWINDOW | SWP_FRAMECHANGED
        );

        isEmbedded = false;
        std::cout << "✅ Window detached successfully" << std::endl;
    }

    void closeEditorHost() {
        if (isEmbedded) {
            detachWindow();
        }

        if (processInfo.hProcess) {
            std::cout << "🛑 Terminating EditorHost process..." << std::endl;
            TerminateProcess(processInfo.hProcess, 0);
            WaitForSingleObject(processInfo.hProcess, 3000); // Wait up to 3 seconds
            CloseHandle(processInfo.hProcess);
            CloseHandle(processInfo.hThread);
        }

        isRunning = false;
        isEmbedded = false;
        editorHostWindow = nullptr;
        processId = 0;
        ZeroMemory(&processInfo, sizeof(processInfo));
        
        std::cout << "✅ EditorHost closed" << std::endl;
    }
};

Nan::Persistent<v8::Function> EditorHostBridge::constructor_template;

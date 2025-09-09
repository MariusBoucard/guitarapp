#include "vst3_host.h"
#include "vst3_plugin.h"
#include "audio_device_manager.h"
#include <iostream>
#include <sstream>

using namespace Steinberg;
using namespace Steinberg::Vst;

Nan::Persistent<v8::Function> VST3Host::constructor_template;

VST3Host::VST3Host() 
    : isAudioProcessing(false), 
      audioDeviceManager(std::make_unique<AudioDeviceManager>()) {
    
    // Initialize COM for VST3 plugins
    CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    std::cout << "✅ VST3Host created" << std::endl;
}

VST3Host::~VST3Host() {
    StopAudioProcessing();
    plugins.clear();
    audioDeviceManager.reset();
    CoUninitialize();
}

void VST3Host::Init(v8::Local<v8::Object> exports) {
    Nan::HandleScope scope;

    // Constructor template
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->SetClassName(Nan::New("VST3Host").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    // Prototype methods
    Nan::SetPrototypeMethod(tpl, "loadPlugin", LoadPlugin);
    Nan::SetPrototypeMethod(tpl, "unloadPlugin", UnloadPlugin);
    Nan::SetPrototypeMethod(tpl, "getPluginList", GetPluginList);
    Nan::SetPrototypeMethod(tpl, "startAudioProcessing", StartAudioProcessing);
    Nan::SetPrototypeMethod(tpl, "stopAudioProcessing", StopAudioProcessing);
    Nan::SetPrototypeMethod(tpl, "setParameterValue", SetParameterValue);
    Nan::SetPrototypeMethod(tpl, "getParameterValue", GetParameterValue);
    Nan::SetPrototypeMethod(tpl, "showPluginUI", ShowPluginUI);
    Nan::SetPrototypeMethod(tpl, "hidePluginUI", HidePluginUI);
    Nan::SetPrototypeMethod(tpl, "getAudioDevices", GetAudioDevices);
    Nan::SetPrototypeMethod(tpl, "initializeAudio", InitializeAudio);
    Nan::SetPrototypeMethod(tpl, "getPluginInfo", GetPluginInfo);

    constructor_template.Reset(tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
    Nan::Set(exports, Nan::New("VST3Host").ToLocalChecked(),
             tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
}

void VST3Host::New(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    if (info.IsConstructCall()) {
        VST3Host* host = new VST3Host();
        host->Wrap(info.This());
        info.GetReturnValue().Set(info.This());
    } else {
        const int argc = 0;
        v8::Local<v8::Value> argv[1];
        v8::Local<v8::Function> cons = Nan::New<v8::Function>(constructor_template);
        info.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
    }
}

void VST3Host::LoadPlugin(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
    
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("Plugin path required");
        return;
    }

    Nan::Utf8String pluginPath(info[0]);
    std::string path(*pluginPath);
    
    try {
        auto plugin = std::make_unique<VST3Plugin>();
        bool success = plugin->LoadFromPath(path);
        
        if (success) {
            std::string pluginId = plugin->GetPluginId();
            host->plugins[pluginId] = std::move(plugin);
            
            v8::Local<v8::Object> result = Nan::New<v8::Object>();
            Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(true));
            Nan::Set(result, Nan::New("pluginId").ToLocalChecked(), Nan::New(pluginId).ToLocalChecked());
            Nan::Set(result, Nan::New("name").ToLocalChecked(), Nan::New(host->plugins[pluginId]->GetPluginName()).ToLocalChecked());
            Nan::Set(result, Nan::New("vendor").ToLocalChecked(), Nan::New(host->plugins[pluginId]->GetVendorName()).ToLocalChecked());
            Nan::Set(result, Nan::New("hasUI").ToLocalChecked(), Nan::New(host->plugins[pluginId]->HasUI()));
            
            info.GetReturnValue().Set(result);
        } else {
            v8::Local<v8::Object> result = Nan::New<v8::Object>();
            Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(false));
            Nan::Set(result, Nan::New("error").ToLocalChecked(), Nan::New("Failed to load plugin").ToLocalChecked());
            info.GetReturnValue().Set(result);
        }
    } catch (const std::exception& e) {
        v8::Local<v8::Object> result = Nan::New<v8::Object>();
        Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(false));
        Nan::Set(result, Nan::New("error").ToLocalChecked(), Nan::New(e.what()).ToLocalChecked());
        info.GetReturnValue().Set(result);
    }
}

void VST3Host::UnloadPlugin(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
    
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("Plugin ID required");
        return;
    }

    Nan::Utf8String pluginId(info[0]);
    std::string id(*pluginId);
    
    auto it = host->plugins.find(id);
    if (it != host->plugins.end()) {
        it->second->HideUI();
        host->plugins.erase(it);
        info.GetReturnValue().Set(Nan::New(true));
    } else {
        info.GetReturnValue().Set(Nan::New(false));
    }
}

void VST3Host::GetPluginList(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
    
    v8::Local<v8::Array> plugins = Nan::New<v8::Array>();
    uint32_t index = 0;
    
    for (const auto& pair : host->plugins) {
        v8::Local<v8::Object> pluginInfo = Nan::New<v8::Object>();
        Nan::Set(pluginInfo, Nan::New("id").ToLocalChecked(), Nan::New(pair.first).ToLocalChecked());
        Nan::Set(pluginInfo, Nan::New("name").ToLocalChecked(), Nan::New(pair.second->GetPluginName()).ToLocalChecked());
        Nan::Set(pluginInfo, Nan::New("vendor").ToLocalChecked(), Nan::New(pair.second->GetVendorName()).ToLocalChecked());
        Nan::Set(pluginInfo, Nan::New("hasUI").ToLocalChecked(), Nan::New(pair.second->HasUI()));
        Nan::Set(pluginInfo, Nan::New("isUIVisible").ToLocalChecked(), Nan::New(pair.second->IsUIVisible()));
        
        Nan::Set(plugins, index++, pluginInfo);
    }
    
    info.GetReturnValue().Set(plugins);
}

void VST3Host::StartAudioProcessing(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
    
    if (!host->isAudioProcessing) {
        bool success = host->audioDeviceManager->StartProcessing();
        host->isAudioProcessing = success;
        info.GetReturnValue().Set(Nan::New(success));
    } else {
        info.GetReturnValue().Set(Nan::New(true));
    }
}

void VST3Host::StopAudioProcessing(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
    
    if (host->isAudioProcessing) {
        host->audioDeviceManager->StopProcessing();
        host->isAudioProcessing = false;
    }
    
    info.GetReturnValue().Set(Nan::New(true));
}

void VST3Host::SetParameterValue(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
    
    if (info.Length() < 3 || !info[0]->IsString() || !info[1]->IsNumber() || !info[2]->IsNumber()) {
        Nan::ThrowTypeError("Invalid parameters: (pluginId, paramId, value) required");
        return;
    }

    Nan::Utf8String pluginId(info[0]);
    std::string id(*pluginId);
    uint32_t paramId = Nan::To<uint32_t>(info[1]).FromJust();
    double value = Nan::To<double>(info[2]).FromJust();
    
    auto it = host->plugins.find(id);
    if (it != host->plugins.end()) {
        bool success = it->second->SetParameterValue(paramId, value);
        info.GetReturnValue().Set(Nan::New(success));
    } else {
        info.GetReturnValue().Set(Nan::New(false));
    }
}

void VST3Host::GetParameterValue(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
    
    if (info.Length() < 2 || !info[0]->IsString() || !info[1]->IsNumber()) {
        Nan::ThrowTypeError("Invalid parameters: (pluginId, paramId) required");
        return;
    }

    Nan::Utf8String pluginId(info[0]);
    std::string id(*pluginId);
    uint32_t paramId = Nan::To<uint32_t>(info[1]).FromJust();
    
    auto it = host->plugins.find(id);
    if (it != host->plugins.end()) {
        double value = it->second->GetParameterValue(paramId);
        info.GetReturnValue().Set(Nan::New(value));
    } else {
        info.GetReturnValue().Set(Nan::Undefined());
    }
}

void VST3Host::ShowPluginUI(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
    
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("Plugin ID required");
        return;
    }

    Nan::Utf8String pluginId(info[0]);
    std::string id(*pluginId);
    
    auto it = host->plugins.find(id);
    if (it != host->plugins.end()) {
        bool success = it->second->ShowUI();
        info.GetReturnValue().Set(Nan::New(success));
    } else {
        info.GetReturnValue().Set(Nan::New(false));
    }
}

void VST3Host::HidePluginUI(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
    
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("Plugin ID required");
        return;
    }

    Nan::Utf8String pluginId(info[0]);
    std::string id(*pluginId);
    
    auto it = host->plugins.find(id);
    if (it != host->plugins.end()) {
        it->second->HideUI();
        info.GetReturnValue().Set(Nan::New(true));
    } else {
        info.GetReturnValue().Set(Nan::New(false));
    }
}

void VST3Host::GetAudioDevices(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
    
    auto devices = host->audioDeviceManager->GetAvailableDevices();
    
    v8::Local<v8::Array> deviceList = Nan::New<v8::Array>();
    for (size_t i = 0; i < devices.size(); ++i) {
        v8::Local<v8::Object> device = Nan::New<v8::Object>();
        Nan::Set(device, Nan::New("id").ToLocalChecked(), Nan::New(static_cast<uint32_t>(i)));
        Nan::Set(device, Nan::New("name").ToLocalChecked(), Nan::New(devices[i]).ToLocalChecked());
        Nan::Set(deviceList, static_cast<uint32_t>(i), device);
    }
    
    info.GetReturnValue().Set(deviceList);
}

void VST3Host::InitializeAudio(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
    
    // Extract audio config if provided
    AudioConfig config;
    if (info.Length() > 0 && info[0]->IsObject()) {
        v8::Local<v8::Object> configObj = Nan::To<v8::Object>(info[0]).ToLocalChecked();
        
        v8::Local<v8::Value> sampleRate = Nan::Get(configObj, Nan::New("sampleRate").ToLocalChecked()).ToLocalChecked();
        if (sampleRate->IsNumber()) {
            config.sampleRate = Nan::To<uint32_t>(sampleRate).FromJust();
        }
        
        v8::Local<v8::Value> bufferSize = Nan::Get(configObj, Nan::New("bufferSize").ToLocalChecked()).ToLocalChecked();
        if (bufferSize->IsNumber()) {
            config.bufferSize = Nan::To<uint32_t>(bufferSize).FromJust();
        }
    }
    
    bool success = host->audioDeviceManager->Initialize(config);
    info.GetReturnValue().Set(Nan::New(success));
}

void VST3Host::GetPluginInfo(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
    
    v8::Local<v8::Object> result = Nan::New<v8::Object>();
    Nan::Set(result, Nan::New("loaded").ToLocalChecked(), Nan::New(!host->plugins.empty()));
    Nan::Set(result, Nan::New("hasEditor").ToLocalChecked(), Nan::New(!host->plugins.empty()));
    Nan::Set(result, Nan::New("pluginCount").ToLocalChecked(), Nan::New(static_cast<uint32_t>(host->plugins.size())));
    Nan::Set(result, Nan::New("isAudioProcessing").ToLocalChecked(), Nan::New(host->isAudioProcessing));
    
    info.GetReturnValue().Set(result);
}

// For backward compatibility with SimpleVST3Host
void VST3Host::NewInstance(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    const int argc = 0;
    v8::Local<v8::Value> argv[1];
    v8::Local<v8::Function> cons = Nan::New<v8::Function>(constructor_template);
    info.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
}

// Module initialization
NAN_MODULE_INIT(InitModule) {
    VST3Host::Init(target);
    
    // Also export SimpleVST3Host for backward compatibility
    Nan::Set(target, Nan::New("SimpleVST3Host").ToLocalChecked(),
             Nan::New<v8::Function>(VST3Host::constructor_template));
}

NODE_MODULE(vst3_host, InitModule)

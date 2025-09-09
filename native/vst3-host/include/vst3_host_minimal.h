#pragma once

#include <nan.h>
#include <memory>
#include <string>
#include <vector>
#include <map>
#include <mutex>
#include <atomic>

class VST3Host : public Nan::ObjectWrap {
public:
    static void Init(v8::Local<v8::Object> exports);
    static void NewInstance(const Nan::FunctionCallbackInfo<v8::Value>& info);

private:
    explicit VST3Host();
    ~VST3Host();

    static void New(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void LoadPlugin(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void UnloadPlugin(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void GetPluginList(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void StartAudioProcessing(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void StopAudioProcessing(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void SetParameterValue(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void GetParameterValue(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void ShowPluginUI(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void HidePluginUI(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void GetAudioDevices(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void SetAudioDevice(const Nan::FunctionCallbackInfo<v8::Value>& info);

    void Shutdown();

    static Nan::Persistent<v8::Function> constructor;

    // Audio settings
    double m_sampleRate;
    int m_blockSize;
    std::atomic<bool> m_isProcessing;

    // Plugin management
    std::mutex m_pluginsMutex;
    std::map<std::string, std::string> m_loadedPlugins; // Mock implementation
};

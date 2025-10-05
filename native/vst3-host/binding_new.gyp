{
  "targets": [
    {
      "target_name": "vst3_host",
      "sources": [
        "src/vst3_host_with_framework.cpp",
        
        # VST3 SDK hosting framework sources
        "../../third_party/VST_SDK/vst3sdk/public.sdk/source/vst/hosting/module.cpp",
        "../../third_party/VST_SDK/vst3sdk/public.sdk/source/vst/hosting/module_win32.cpp",
        "../../third_party/VST_SDK/vst3sdk/public.sdk/source/vst/hosting/plugprovider.cpp",
        "../../third_party/VST_SDK/vst3sdk/public.sdk/source/vst/hosting/hostclasses.cpp",
        "../../third_party/VST_SDK/vst3sdk/public.sdk/source/vst/hosting/eventlist.cpp",
        "../../third_party/VST_SDK/vst3sdk/public.sdk/source/vst/hosting/parameterchanges.cpp",
        "../../third_party/VST_SDK/vst3sdk/public.sdk/source/vst/hosting/processdata.cpp",
        "../../third_party/VST_SDK/vst3sdk/public.sdk/source/vst/hosting/pluginterfacesupport.cpp",
        "../../third_party/VST_SDK/vst3sdk/public.sdk/source/vst/hosting/connectionproxy.cpp",
        
        # VST3 SDK base sources
        "../../third_party/VST_SDK/vst3sdk/pluginterfaces/base/funknown.cpp",
        "../../third_party/VST_SDK/vst3sdk/pluginterfaces/base/ustring.cpp",
        "../../third_party/VST_SDK/vst3sdk/base/source/fobject.cpp",
        "../../third_party/VST_SDK/vst3sdk/base/source/updatehandler.cpp",
        "../../third_party/VST_SDK/vst3sdk/base/source/fstring.cpp",
        "../../third_party/VST_SDK/vst3sdk/base/source/fbuffer.cpp",
        "../../third_party/VST_SDK/vst3sdk/base/source/fdebug.cpp",
        "../../third_party/VST_SDK/vst3sdk/base/source/fdynlib.cpp",
        "../../third_party/VST_SDK/vst3sdk/base/source/fstreamer.cpp",
        "../../third_party/VST_SDK/vst3sdk/base/source/timer.cpp",
        "../../third_party/VST_SDK/vst3sdk/base/thread/source/flock.cpp"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "../../third_party/VST_SDK/vst3sdk"
      ],
      "libraries": [
        "ole32.lib",
        "oleaut32.lib"
      ],
      "defines": [
        "UNICODE",
        "_UNICODE",
        "WIN32",
        "_WINDOWS",
        "SMTG_OS_WINDOWS=1",
        "SMTG_CPP17_AVAILABLE=1",
        "SMTG_CPP20_AVAILABLE=1"
      ],
      "cflags_cc": [
        "/std:c++20",
        "/EHsc"
      ],
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": 1,
          "RuntimeLibrary": 2,
          "AdditionalOptions": [
            "/std:c++20"
          ]
        }
      }
    }
  ]
}

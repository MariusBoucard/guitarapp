{
  "targets": [
    {
      "target_name": "vst3_host",
      "sources": [
        "src/vst3_host_real.cpp",
        # VST3 SDK base sources
        "../../third_party/vst3sdk/base/source/baseiids.cpp",
        "../../third_party/vst3sdk/base/source/fbuffer.cpp",
        "../../third_party/vst3sdk/base/source/fdebug.cpp",
        "../../third_party/vst3sdk/base/source/fobject.cpp",
        "../../third_party/vst3sdk/base/source/fstreamer.cpp",
        "../../third_party/vst3sdk/base/source/fstring.cpp",
        "../../third_party/vst3sdk/base/source/timer.cpp",
        "../../third_party/vst3sdk/base/source/updatehandler.cpp",
        "../../third_party/vst3sdk/base/thread/source/flock.cpp",
        # VST3 SDK hosting sources
        "../../third_party/vst3sdk/public.sdk/source/main/dllmain.cpp",
        "../../third_party/vst3sdk/public.sdk/source/main/pluginfactory.cpp",
        "../../third_party/vst3sdk/public.sdk/source/common/memorystream.cpp",
        "../../third_party/vst3sdk/public.sdk/source/common/pluginview.cpp",
        # VST3 SDK hosting module
        "../../third_party/vst3sdk/public.sdk/source/vst/hosting/module.cpp",
        "../../third_party/vst3sdk/public.sdk/source/vst/hosting/plugprovider.cpp"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "../../third_party/vst3sdk",
        "../../third_party/vst3sdk/base",
        "../../third_party/vst3sdk/pluginterfaces",
        "../../third_party/vst3sdk/public.sdk",
        "../../third_party/vst3sdk/public.sdk/source",
        "../../third_party/vst3sdk/public.sdk/source/vst",
        "../../third_party/vst3sdk/public.sdk/source/vst/hosting"
      ],
      "defines": [
        "DEVELOPMENT=1",
        "RELEASE=1"
      ],
      "conditions": [
        ["OS=='win'", {
          "defines": [
            "_WIN32",
            "WIN32",
            "_CRT_SECURE_NO_WARNINGS",
            "NOMINMAX"
          ],
          "libraries": [
            "-lole32",
            "-loleaut32",
            "-luuid",
            "-luser32",
            "-lgdi32",
            "-lkernel32",
            "-lshell32",
            "-lcomdlg32",
            "-ladvapi32"
          ],
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1,
              "AdditionalOptions": ["/EHsc"]
            }
          }
        }]
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "cflags": ["-fexceptions"],
      "cflags_cc": ["-fexceptions"]
    }
  ]
}

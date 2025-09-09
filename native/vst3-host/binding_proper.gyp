{
  "targets": [
    {
      "target_name": "vst3_host",
      "sources": [
        "src/vst3_host_proper.cpp"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "../../third_party/vst3sdk",
        "../../third_party/vst3sdk/pluginterfaces",
        "../../third_party/vst3sdk/public.sdk",
        "../../third_party/vst3sdk/base"
      ],
      "libraries": [
        "-lole32",
        "-loleaut32",
        "-luuid",
        "-luser32",
        "-lkernel32",
        "-lgdi32",
        "-lwinspool",
        "-lcomdlg32",
        "-ladvapi32",
        "-lshell32",
        "-lcomctl32"
      ],
      "defines": [
        "UNICODE",
        "_UNICODE",
        "WIN32_LEAN_AND_MEAN",
        "NOMINMAX",
        "DEVELOPMENT=1"
      ],
      "conditions": [
        ["OS==\"win\"", {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1,
              "RuntimeTypeInfo": "true",
              "AdditionalOptions": ["/EHsc"]
            },
            "VCLinkerTool": {
              "SubSystem": 1
            }
          }
        }]
      ],
      "cflags_cc": [
        "-std=c++17",
        "-fexceptions",
        "-frtti"
      ],
      "link_settings": {
        "libraries": [
          "../../third_party/vst3sdk/build/lib/Release/base.lib",
          "../../third_party/vst3sdk/build/lib/Release/pluginterfaces.lib",
          "../../third_party/vst3sdk/build/lib/Release/sdk.lib",
          "../../third_party/vst3sdk/build/lib/Release/sdk_hosting.lib"
        ]
      }
    }
  ]
}

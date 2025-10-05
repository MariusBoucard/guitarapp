@echo off
echo Buirem Generate Visual Studio project files
echo Generating Visual Studio project files...
cmake -G "Visual Studio 17 2022" -A x64 .. ^
  -DSMTG_ENABLE_VST3_PLUGIN_EXAMPLES=OFF ^
  -DSMTG_ENABLE_VSTGUI_SUPPORT=OFF ^
  -DCMAKE_CXX_FLAGS_RELEASE="/MT" ^
  -DCMAKE_C_FLAGS_RELEASE="/MT"ng VST3 SDK...

rem Check if cmake is available
cmake --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: CMake is not installed or not in PATH
    echo Please install CMake from https://cmake.org/download/
    pause
    exit /b 1
)

rem Navigate to VST3 SDK directory
cd /d "%~dp0..\third_party\vst3sdk"

rem Create build directory
if not exist "build" mkdir build
cd build

rem Generate Visual Studio project files
echo Generating Visual Studio project files...
cmake -G "Visual Studio 17 2022" -A x64 .. -DSMTG_ENABLE_VST3_PLUGIN_EXAMPLES=OFF -DSMTG_ENABLE_VSTGUI_SUPPORT=OFF -DCMAKE_MSVC_RUNTIME_LIBRARY="MultiThreaded"

if errorlevel 1 (
    echo ERROR: Failed to generate Visual Studio project files
    echo Make sure you have Visual Studio 2022 installed
    pause
    exit /b 1
)

rem Build the SDK in Release mode
echo Building VST3 SDK in Release mode...
cmake --build . --config Release --target sdk --target sdk_hosting --target base --target pluginterfaces

if errorlevel 1 (
    echo ERROR: Failed to build VST3 SDK
    pause
    exit /b 1
)

echo VST3 SDK build completed successfully!
echo Libraries are available in build\lib\Release\

pause

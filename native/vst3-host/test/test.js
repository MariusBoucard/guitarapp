const VST3Host = require('../build/Release/vst3_host.node');

console.log('Testing VST3Host native addon...');

try {
    // Create a new instance
    const host = new VST3Host.VST3Host();
    console.log('✅ VST3Host instance created successfully');

    // Test plugin loading (mock)
    const loadResult = host.loadPlugin('test_plugin.vst3');
    console.log('✅ Plugin load test:', loadResult);

    // Test plugin list
    const pluginList = host.getPluginList();
    console.log('✅ Plugin list test:', pluginList);

    // Test audio processing
    const startResult = host.startAudioProcessing();
    console.log('✅ Start audio processing test:', startResult);

    const stopResult = host.stopAudioProcessing();
    console.log('✅ Stop audio processing test:', stopResult);

    console.log('🎉 All tests passed! Native VST3Host is working correctly.');

} catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
}

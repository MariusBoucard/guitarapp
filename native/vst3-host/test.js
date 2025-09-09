const vst3Host = require('./build/Release/vst3_host.node');

console.log('Testing Simple VST3 Host...');

try {
    const host = new vst3Host.SimpleVST3Host();
    console.log('✅ SimpleVST3Host created successfully!');
    
    const info = host.getPluginInfo();
    console.log('Plugin info:', info);
    
    console.log('🎉 VST3 Host is working! Ready to load plugins.');
} catch (error) {
    console.error('❌ Error:', error.message);
}

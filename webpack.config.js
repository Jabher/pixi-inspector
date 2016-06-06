module.exports.entry = './src/bootstrap.js';
module.exports.devtool = 'source-map';
module.exports.output = {
    filename: 'pixi-panel.js',
    path: __dirname + '/build'
};
module.exports.resolve = {
    extensions: ['', '.jsx', '.js']
};
module.exports.module = {
    loaders: [
        {
            test: /\.js(x)?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'react', 'stage-0']
            }
        },
        {
            test: /\.css$/,
            loader: 'style!css'
        },
        {
            test: /\.png$/,
            loader: 'url'
        }
    ]
};
module.exports.externals = {
    //don't bundle the 'react' npm package with our bundle.js
    //but get it from a global 'React' variable
    'react': 'React',
    'react-dom': 'ReactDOM',
    'rx': 'Rx'
};
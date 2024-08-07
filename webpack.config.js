const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: ['./src/client/index.js'],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.css$/,
				exclude: /\.module\.css$/, // Исключаем CSS-модули
				use: [
				  MiniCssExtractPlugin.loader, 
				  'css-loader', // Обычная обработка CSS
				],
			  },
			  {
				test: /\.module\.css$/, // Обработка CSS-модулей
				use: [
				  MiniCssExtractPlugin.loader,
				  {
					loader: 'css-loader',
					options: {						
					  	modules: {
							localIdentName: '[local]__[hash:base64:5]',
						},
					},
				  },
				],
			  },
			{
				test: /\.(png|woff|woff2|eot|ttf|svg)$/,
				use: {
					loader: 'file-loader',
				},
			},
		],
	},
	resolve: {
		extensions: ['*', '.js', '.jsx'],
	},
	devServer: {
		port: 3001,
		proxy: {
			'/api': 'http://localhost:3000',
			'/': 'http://localhost:3000',
		},
		client: {overlay: false},
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: './public/index.html',
			favicon: './assets/favicon.png',
			inject: 'body', // This line is important for injecting CSS.
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css',
		}),
	],
};

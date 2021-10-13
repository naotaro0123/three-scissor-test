import { RuleSetRule, Configuration } from 'webpack';
import * as path from 'path';

const rules: RuleSetRule[] = [
  {
    exclude: /node_modules/,
    test: /\.ts$/,
    use: 'ts-loader',
  },
  {
    test: /\.(frag|vert|glsl)$/,
    use: [
      {
        loader: 'webpack-glsl-loader',
        options: {},
      },
    ],
  },
];

const config: Configuration = {
  mode: 'development',
  entry: {
    main: './src/index.ts',
  },
  output: {
    path: `${__dirname}/dist`,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules,
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, './src'),
    },
    port: 4000,
    open: true,
  },
};

export default config;

const isDevelopment: boolean = process.env.NODE_ENV === 'development';
const isProduction: boolean = process.env.NODE_ENV === 'production';


export {
    isDevelopment,
    isProduction
}

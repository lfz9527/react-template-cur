/**
 * 将查询字符串解析为对象
 * @param queryString - 要解析的查询字符串
 * @returns 包含查询字符串键值对的对象
 */
export function parseQueryStringToObj(queryString:string):{
    [key:string]: any
} {
    const obj = {};

    // 去除多余的空格并分割字符串
    const pairs = queryString.trim().split('&');

    pairs.forEach(pair => {
        const [key, value] = pair.split('=');

        // 确保键和值都存在，并去掉多余的空格
        if (key && value) {
            obj[key.trim()] = value.trim();
        }
    });

    return obj;
}

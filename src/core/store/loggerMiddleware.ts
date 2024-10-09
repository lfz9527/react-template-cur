// 导入 zustand 库中的相关类型定义
import {StateCreator, StoreMutatorIdentifier} from 'zustand'

/**
 * 定义一个类型 Logger，它接受一个状态创建函数 f，以及可选的名称 name，并返回一个新的状态创建函数。
 * @template T 状态的类型。
 * @template Mps 中间件参数的类型数组。
 * @template Mcs 中间件上下文的类型数组。
 */
type Logger = <
    T,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
    f: StateCreator<T, Mps, Mcs>,
    name?: string
) => StateCreator<T, Mps, Mcs>

/**
 * 定义一个类型 LoggerImpl，它是 Logger 的一个实现，接受一个状态创建函数 f，以及可选的名称 name，并返回一个新的状态创建函数。
 * @template T 状态的类型。
 */
type LoggerImpl = <T>(
    f: StateCreator<T, [], []>,
    name?: string
) => StateCreator<T, [], []>

/**
 * 实现 LoggerImpl 类型的 loggerImpl 函数。
 * 该函数用于创建一个带有日志记录功能的状态存储。
 * @param f 状态创建函数。
 * @param name 日志记录的名称，可选。
 * @returns 一个新的状态创建函数，该函数在每次状态更新时都会记录日志。
 */
const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
    // 创建一个新的 set 函数，用于记录日志
    const loggedSet: typeof set = (...args) => {
        // 调用原始的 set 函数来更新状态
        // @ts-ignore
        set(...args)
        // 记录日志，包括可选的名称和当前状态
        console.log(...(name ? [`${name}:`] : []), get())
    }

    // 将新的 set 函数设置到 store 中
    store.setState = loggedSet

    // 返回应用了日志记录功能的状态创建函数
    return f(loggedSet, get, store)
}

// 将 loggerImpl 作为 Logger 类型导出，以便在其他地方使用
export const logger = loggerImpl as unknown as Logger

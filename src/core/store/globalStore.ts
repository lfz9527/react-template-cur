import {create} from 'zustand'
import {persist, createJSONStorage, devtools} from 'zustand/middleware'
import {logger} from './loggerMiddleware'

interface State {
    appId: string
}

interface Action {
    setAppId: (appId: State['appId']) => void
}

const useGlobalStore = create<State & Action>()(
    logger(
        devtools(
            persist(
                (set) => ({
                    appId: '',
                    setAppId: (appId: State['appId']) => set({appId})
                }),
                {
                    name: 'globalState',
                    storage: createJSONStorage(() => localStorage)
                }
            ),
            {name: 'globalState'}
        )
    )
)

export default useGlobalStore

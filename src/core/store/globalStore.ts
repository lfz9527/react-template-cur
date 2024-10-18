import {create} from 'zustand'
import {persist, createJSONStorage, devtools} from 'zustand/middleware'
import {logger} from './loggerMiddleware'

interface State {
    uuid: string
}

interface Action {
    setUuid: (uuid: State['uuid']) => void
}

const useGlobalStore = create<State & Action>()(
    logger(
        devtools(
            persist(
                (set) => ({
                    uuid: '',
                    setUuid: (uuid: State['uuid']) => set({uuid})
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

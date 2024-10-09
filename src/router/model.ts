import SuspenseLazy from '@/components/SuspenseLazy'

const Home = SuspenseLazy(
    () => import(/* webpackChunkName:"home" */ '@/views/home')
)

export default [
    {
        path: '/',
        element: Home
    }
]

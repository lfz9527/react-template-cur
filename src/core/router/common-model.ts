import SuspenseLazy from '@/components/SuspenseLazy'

const Home = SuspenseLazy(
    () => import(/* webpackChunkName:"home" */ '@/common-page/home')
)
const NotFound = SuspenseLazy( ()=> import(/* webpackChunkName:"notFound" */ '@/common-page/notFound'))

export default [
    {
        path: '/',
        element: Home
    },
    {
        path: '*',
        element: NotFound
    }
]

import SuspenseLazy from '@/components/SuspenseLazy'

const Client1 = SuspenseLazy(
    () => import(/* webpackChunkName:"home" */ '@/pages/client1')
)
const Client2 = SuspenseLazy( ()=> import(/* webpackChunkName:"notFound" */  '@/pages/client2'))

export default [
    {
        path: '/client1',
        element: Client1
    },
    {
        path: '/client2',
        element: Client2
    }
]

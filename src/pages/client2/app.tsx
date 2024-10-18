import React,{useState,useRef,useEffect} from 'react'
import '@/styles/app.less'
import PWAInstall from '@khmyznikov/pwa-install/react-legacy'
import {PWAInstallElement} from '@khmyznikov/pwa-install'
import logo from './static_config/256.png'
const App = () => {
    const appName = 'Client2'

    const [promptEvent, setPromptEvent] = useState(null)
    const pwaInstallRef = useRef<PWAInstallElement>(null)

    useEffect(() => {
        let lastPromptEvent = window.promptEvent

        const intervalId = setInterval(() => {
            if (window.promptEvent !== lastPromptEvent) {
                lastPromptEvent = window.promptEvent
                setPromptEvent(window.promptEvent)
            }
        }, 100)
        return () => {
            clearInterval(intervalId)
        }
    }, [])
    return (
        <div className='app'>
            <div>
                <a href='/client1'>To_client1</a>
            </div>
            Client2

            <PWAInstall
                ref={pwaInstallRef}
                name={appName}
                icon={logo}
                manifestUrl={window.location.origin + '/client2/manifest.json'}
                externalPromptEvent={promptEvent}
                onPwaInstallAvailableEvent={(event) => console.log(event)}
            ></PWAInstall>
        </div>
    )
}
export default App

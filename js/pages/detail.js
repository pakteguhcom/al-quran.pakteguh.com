import apiEndpoint from '../constant/api-endpoint.js'

document.addEventListener("DOMContentLoaded", main)

/**
 * Main function
 */
async function main() {
    const loadingAnimation = getLoadingAnimationContainer()
    const notFoundAnimation = getNotFoundAnimationContainer()
    const errorAnimation = getErrorAnimationContainer()
    const mainApp = getMainAppContainer()

    try {
        loadingAnimation.style.display = 'flex'
        notFoundAnimation.style.display = 'none'
        errorAnimation.style.display = 'none'
        mainApp.style.display = 'none'

        const numberSurah = getNumberSurah()
        if (isNumberSurahValid(numberSurah)) {
            const endpoint = apiEndpoint.detailSurah.url(numberSurah)
            const response = await fetch(endpoint)
            const responseJSON = await response.json()
            const quranData = responseJSON.data
            renderNavbar({ 
                name: quranData.asma.id.short,
                number: quranData.number,                
            })
            renderListAyahElements(quranData)

            loadingAnimation.style.display = 'none'
            mainApp.style.display = 'block'
            return
        }
        
        notFoundAnimation.style.display = 'flex'
        loadingAnimation.style.display = 'none'
        mainApp.style.display = 'none'
    } catch (trace) {
        console.error(trace)
        loadingAnimation.style.display = 'none'
        notFoundAnimation.style.display = 'none'
        errorAnimation.style.display = 'flex'
        mainApp.style.display = 'none'
    }
}

/**
 * Get number surah from window query params
 */
function getNumberSurah () {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('numberSurah');
}

/**
 * Cheking is value between 1 and 114
 * @param {number} value
 */
function isNumberSurahValid (value) {
    return (value >= 1 && value <= 114) ? true : false
}

/**
 * Get Loading Animation DOM Element Container
 */
function getLoadingAnimationContainer () {
    return document.querySelector('.loadingAnimation')
}

/**
 * Get Not Found Animation DOM Element Container
 * @returns
 */
function getNotFoundAnimationContainer () {
    return document.querySelector('.notFoundAnimation')
}

/**
 * Get Error Animation DOM Element Container
 * @returns
 */
function getErrorAnimationContainer () {
    return document.querySelector('.errorAnimation')   
}

/**
 * Get Main Application DOM Element Container
 * @returns
 */
function getMainAppContainer () {
    return document.querySelector('#mainApp')
}

/**
 * Get Navbar Element Container
 */
function getNavbarContainer () {
    return document.querySelector('#navbar')
}

/**
 * Get Content Container DOM Element
 */
function getContentContainer () {
    return document.querySelector('#content')
}

/**
 * Get Ayah Container Element
 * @returns
 */
function getAyahContainer () {
    return getContentContainer().querySelector('#ayahContainer')
}

/**
 * Get Audio Control Element
 */
function getAudioControl () {
    return document.querySelector('#audioPanel audio')
}

/**
 * Create string ayah item element
 * @param {object} quranData
 * @param {string|number} quranData.juzNumber
 * @param {string|number} quranData.ayahNumber
 * @param {string} quranData.arabic
 * @param {string} quranData.read
 * @param {string} quranData.translation
 */
function AyahItem({ juzNumber = '', ayahNumber = '', arabic, read, translation }) {
    const surahAyahElement = (juzNumber !== '' && ayahNumber !== '')
        ? `
            <div class="topContainer">
                <div class="surahAndAyahInfo">${juzNumber}:${ayahNumber}</div>
                <button>
                    <span class="material-icons">play_arrow</span>                
                </button>
            </div>
        ` : ''

    return `
        <div class="ayahItem">
            ${surahAyahElement}
            <div class="arabic">
                ${arabic}
            </div>
            <div class="read">
                ${read}
            </div>
            <div class="translation">
                ${translation}
            </div>
        </div>
    `
}

/**
 * Render Navbar Children with Surah Information
 * @param {object} surah 
 * @param {string|number} surah.number
 * @param {string} surah.name
 */
function renderNavbar({ type, number, name, ayahCount }) {
    const surahNameElement = getNavbarContainer().querySelector('.surahName')
    const backButton = getNavbarContainer().querySelector('.backButton')
    surahNameElement.innerText = `${number}. ${name}`
    backButton.onclick = () => {
        window.location.href = './index.html'
    }
}

/**
 * Render quran ayah item elements
 */
function renderListAyahElements (quranData) {
    const ayahContainer = getAyahContainer()
    const audioControl = getAudioControl()
    const preBismillah = quranData.preBismillah
    const defaultValueListAyahElements = (preBismillah !== null) 
        ? AyahItem({
            arabic: preBismillah.text.ar,
            read: preBismillah.text.read,
            translation: preBismillah.translation.id
        }) : ''

    const listAyahElements = quranData.ayahs.reduce((elements, ayah) => {
        return elements + AyahItem({
            juzNumber: ayah.juz,
            ayahNumber: ayah.number.insurah,
            arabic: ayah.text.ar,
            read: ayah.text.read,
            translation: ayah.translation.id 
        })
    }, defaultValueListAyahElements)

    ayahContainer.innerHTML = listAyahElements
    audioControl.src = quranData.recitation.full
    setListAyahElementsListener(quranData)
}

/**
 * Set play pause audo on ayah item element
 */
function setListAyahElementsListener (quranData) {
    const audioControl = getAudioControl()
    const ayahsElements = getContentContainer().querySelectorAll('.ayahItem')
    let playedAyah = null
    let isPlaying = false

    ayahsElements.forEach(element => {
        const buttonPlay = element.querySelector('button')
        const elementNumberOfSurahInfo = element.querySelector('.surahAndAyahInfo')
        if (elementNumberOfSurahInfo) {
            const [juzNumber, ayahNumber] = elementNumberOfSurahInfo.innerText.split(':')
            const ayahObjectData = quranData.ayahs.find(ayah => ayah.number.insurah == ayahNumber)
            const ayahAudioUrl = ayahObjectData.audio.url

            buttonPlay.onclick = () => {
                if (playedAyah && Number(ayahNumber) === playedAyah) {
                    isPlaying ? audioControl.pause() : audioControl.play()
                } else {
                    audioControl.src = ayahAudioUrl
                    playedAyah = Number(ayahNumber)
                    audioControl.play()
                }

                if (isPlaying) {
                    buttonPlay.querySelector('.material-icons').innerHTML = 'play_arrow'
                } else {
                    buttonPlay.querySelector('.material-icons').innerHTML = 'pause'
                }
            }
        }
    })

    audioControl.onplaying = () => {    
        isPlaying = true
        let listActiveAyahElement = []
        let playedAyahElement = null            
        ayahsElements.forEach(element => {
            const elementNumberOfSurahInfo = element.querySelector('.surahAndAyahInfo')
            if (elementNumberOfSurahInfo) {
                const [juzNumber, ayahNumber] = elementNumberOfSurahInfo.innerText.split(':')

                if (element.classList.contains('active')) {
                    listActiveAyahElement.push(element)
                }

                if (playedAyah) {
                    if (ayahNumber === playedAyah.toString()) {
                        playedAyahElement = element
                    }
                }
            }
        })

        listActiveAyahElement.forEach(element => {
            element.classList.remove("active")
        })

        if (playedAyahElement) {
            playedAyahElement.classList.add("active")
            playedAyahElement.scrollIntoView({behavior: "smooth", block: "start"})
        }
    }

    audioControl.onpause = () => {
        isPlaying = false
        let playedAyahElement = null            
        ayahsElements.forEach(element => {
            const elementNumberOfSurahInfo = element.querySelector('.surahAndAyahInfo')
            if (elementNumberOfSurahInfo) {
                const [juzNumber, ayahNumber] = elementNumberOfSurahInfo.innerText.split(':')
                if (playedAyah) {
                    if (ayahNumber === playedAyah.toString()) {
                        playedAyahElement = element
                    }
                }
            }
        })

        if (playedAyahElement) {
            playedAyahElement.classList.remove("active")
        }
    }

    audioControl.onended = () => {
        const nextAyahNumber = playedAyah + 1
        const ayahObjectData = quranData.ayahs.find(ayah => ayah.number.insurah === nextAyahNumber)

        if (ayahObjectData) {
            const ayahAudioUrl = ayahObjectData.audio.url
            audioControl.src = ayahAudioUrl
            audioControl.play()
            playedAyah = nextAyahNumber
            isPlaying = true
        } else {
            playedAyah = null
            isPlaying = false
        }
    }
}
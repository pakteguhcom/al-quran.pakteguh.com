import apiEndpoint from '../constant/api-endpoint.js'

document.addEventListener("DOMContentLoaded", main)

/**
 * Main function
 */
async function main() {
    try {
        const numberSurah = getNumberSurah()
        if (isNumberSurahValid(numberSurah)) {
            const endpoint = apiEndpoint.detailSurah.url(numberSurah)
            const response = await fetch(endpoint)
            const responseJSON = await response.json()
            const quranData = responseJSON.data
            renderListAyahElements(quranData)
        }
    } catch (trace) {
        console.error(trace)
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
 * Get Content Container DOM Element
 */
function getContentContainer () {
    return document.querySelector('#content')
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
 * @param {string|number} quranData.surahNumber
 * @param {string|number} quranData.ayahNumber
 * @param {string} quranData.arabic}
 * @param {string} quranData.read
 * @param {string} quranData.translation
 */
function AyahItem({ surahNumber = '', ayahNumber = '', arabic, read, translation }) {
    const surahAyahElement = (surahNumber !== '' && ayahNumber !== '')
        ? `
            <div>
                <div class="surahAndAyahInfo">${surahNumber}:${ayahNumber}</div>
                <button>Play</button>
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
 * Render quran ayah item elements
 */
function renderListAyahElements (quranData) {
    const contentContainer = getContentContainer()
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
            surahNumber: quranData.number,
            ayahNumber: ayah.number.insurah,
            arabic: ayah.text.ar,
            read: ayah.text.read,
            translation: ayah.translation.id 
        })
    }, defaultValueListAyahElements)

    contentContainer.innerHTML = listAyahElements
    audioControl.src = quranData.recitation.full
    setListAyahElementsListener(quranData)
}

/**
 * Set play pause audo on ayah item element
 */
function setListAyahElementsListener (quranData) {
    const contentContainer = getContentContainer()
    const audioControl = getAudioControl()
    const ayahsElements = getContentContainer().querySelectorAll('.ayahItem')
    let playedAyah = null

    ayahsElements.forEach(element => {
        const buttonPlay = element.querySelector('button')
        const elementNumberOfSurahInfo = element.querySelector('.surahAndAyahInfo')
        if (elementNumberOfSurahInfo) {
            const [surahNumber, ayahNumber] = elementNumberOfSurahInfo.innerText.split(':')
            const ayahObjectData = quranData.ayahs.find(ayah => ayah.number.insurah == ayahNumber)
            const ayahAudioUrl = ayahObjectData.audio.url

            buttonPlay.onclick = () => {
                audioControl.src = ayahAudioUrl
                playedAyah = Number(ayahNumber)
                audioControl.play()
            }
        }
    })

    audioControl.onplaying = () => {    
        let listActiveAyahElement = []
        let playedAyahElement = null            
        ayahsElements.forEach(element => {
            const elementNumberOfSurahInfo = element.querySelector('.surahAndAyahInfo')
            if (elementNumberOfSurahInfo) {
                const [surahNumber, ayahNumber] = elementNumberOfSurahInfo.innerText.split(':')

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
        let playedAyahElement = null            
        ayahsElements.forEach(element => {
            const elementNumberOfSurahInfo = element.querySelector('.surahAndAyahInfo')
            if (elementNumberOfSurahInfo) {
                const [surahNumber, ayahNumber] = elementNumberOfSurahInfo.innerText.split(':')
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
        } else {
            playedAyah = null
        }
    }
}
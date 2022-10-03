import * as d3 from 'd3'
import {geoMiller, geoPatterson, geoRobinson} from 'd3-geo-projection'
import {derived, readable, writable} from 'svelte/store'
import * as topojsonClient from 'topojson-client'

import {browser} from '$app/environment'

const dateZero = new Date('February 19, 2022 03:00:00')
const oneDay = 24 * 3600 * 1000
export const projections = [
    {func: geoPatterson(), name: 'Patterson'},
    {func: geoRobinson(), name: 'Robinson'},
    {func: geoMiller(), name: 'Miller'},
    {func: d3.geoMercator(), name: 'Mercator'},
    {func: d3.geoOrthographic(), name: 'Globe'}
]

// Map
export const topojson = writable()
export const geojson = derived(topojson, $topojson => ($topojson ? topojsonClient.feature($topojson, $topojson.objects.countries) : undefined))

// Settings
export const soundEffects = writable(true)
export const projection = writable(projections[0].func)

// Game
export const mousePos = writable({x: 0, y: 0})
export const clientX = writable(0)
export const clientY = writable(0)
export const debug = writable()
export const notifications = writable([])
export const tags = writable([])
export const time = readable(new Date(), function start(set) {
    setInterval(() => set(new Date()), 1000)
})
export const day = derived(time, $time => Math.floor(($time.getTime() - dateZero.getTime()) / oneDay))
export const timeLeft = derived(time, $time => {
    const left = Math.abs(Math.floor(((($time.getTime() - dateZero.getTime()) % oneDay) - oneDay) / 1000))
    const hours = Math.floor(left / 3600)
        .toString()
        .padStart(2, '0')
    const minutes = Math.floor((left % 3600) / 60)
        .toString()
        .padStart(2, '0')
    const seconds = Math.floor(left % 60)
        .toString()
        .padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
})

// Save files
export const initialSave = {achievements: [], dailyQuestProgress: {}}
const saveKey = 'save'
let localStorageSave = initialSave

try {
    localStorageSave = browser ? JSON.parse(window.localStorage.getItem(saveKey)) ?? initialSave : initialSave
} catch (err) {
    console.error(err)
}

export const save = writable(localStorageSave)
save.subscribe(value => {
    if (browser) window.localStorage.setItem(saveKey, JSON.stringify(value))
})

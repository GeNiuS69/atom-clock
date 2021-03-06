'use babel';

import { CompositeDisposable } from 'atom'
import Moment from 'moment'

export default class AtomClockView {

  constructor(statusBar) {
    this.statusBar = statusBar
    this.subscriptions = new CompositeDisposable()
  }

  start() {
    this.drawElement()
    this.initialize()
  }

  initialize() {
    this.setConfigValues()
    this.setDate()
    this.setIcon(this.showIcon)
    this.startTicker()

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-clock:toggle': () => this.toggle()
    }))

    this.subscriptions.add(atom.config.onDidChange('atom-clock.dateFormat', () => {
      this.refreshTicker()
    }))

    this.subscriptions.add(atom.config.onDidChange('atom-clock.locale', () => {
      this.refreshTicker()
    }))

    this.subscriptions.add(atom.config.onDidChange('atom-clock.refreshInterval', () => {
      this.refreshTicker()
    }))

    this.subscriptions.add(atom.config.onDidChange('atom-clock.showClockIcon', () => {
      this.setConfigValues()
      this.setIcon(this.showIcon)
    }))
  }

  drawElement() {
    this.element = document.createElement('div')
    this.element.id = 'atom-clock'
    this.element.className = 'inline-block'
    this.element.appendChild(document.createElement('span'))

    this.statusBar.addRightTile({
      item: this.element,
      priority: -1
    })
  }

  setConfigValues() {
    this.dateFormat = atom.config.get('atom-clock.dateFormat')
    this.locale = atom.config.get('atom-clock.locale')
    this.refreshInterval = atom.config.get('atom-clock.refreshInterval') * 1000
    this.showIcon = atom.config.get('atom-clock.showClockIcon')
  }

  startTicker() {
    this.setDate()
    var nextTick = this.refreshInterval - (Date.now() % this.refreshInterval)
    this.tick = setTimeout (() =>  { this.startTicker() }, nextTick)
  }

  clearTicker() {
    if (this.tick)
      clearTimeout(this.tick)
  }

  refreshTicker() {
    this.setConfigValues()
    this.clearTicker()
    this.startTicker()
  }

  setDate() {
    this.date = Moment().locale(this.locale).format(this.dateFormat)
    this.element.firstChild.textContent = this.date
  }

  setIcon(toSet) {
    if (toSet)
      this.element.firstChild.className += 'icon icon-clock'
    else
      this.element.firstChild.className = ''
  }

  toggle() {
    style = this.element.style.display
    this.element.style.display = style === 'none' ? '' : 'none'
  }

  destroy() {
    this.clearTicker()
    this.subscriptions.dispose()
    this.element.parentNode.removeChild(this.element)
  }

}

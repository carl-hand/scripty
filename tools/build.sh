#!/bin/bash

build() {
    echo 'building react'

    rm -rf build/*

    export INLINE_RUNTIME_CHUNK=false
    export GENERATE_SOURCEMAP=true

    react-scripts build

    cp manifest.json build/manifest.json
    cp src/chrome/background.js build
    cp src/chrome/inject.js build
    cp src/index.css build

    # sed -i 's#"/static/js/".*$#"/static/js/": "",#g' build/index.html
    # runtime="/static/js/runtime-main.*.js"
    # chunk='/static/js/2.*.chunk.js'
    # main='/static/js/main.*.chunk.js'
}

build
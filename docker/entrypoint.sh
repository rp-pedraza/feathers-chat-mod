#!/bin/sh

set -e

# Automatically create a new sqlite file
if [ ! -e /feathers-chat-mod/data/feathers-chat-mod.sqlite ]; then
	cp -v /feathers-chat-mod/data.skel/feathers-chat-mod.sqlite \
			/feathers-chat-mod/data/feathers-chat-mod.sqlite
fi

exec "$@"

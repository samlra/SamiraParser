#!/bin/bash

id -u logviewer &>/dev/null || useradd logviewer

usermod -a -G bosch logviewer

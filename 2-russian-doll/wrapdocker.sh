#!/bin/bash
# URL: https://raw.githubusercontent.com/jpetazzo/dind/977fcab64737b1c79bf81543a318884b3ac314ad/wrapdocker
# License: Apache 2.0

export container=docker

if [ -d /sys/kernel/security ] && ! mountpoint -q /sys/kernel/security; then
  mount -t securityfs none /sys/kernel/security || {
    echo >&2 'Could not mount /sys/kernel/security.'
    echo >&2 'AppArmor detection and --privileged mode might break.'
  }
fi

# https://github.com/docker/for-linux/issues/1105#issuecomment-913964377
update-alternatives --set iptables /usr/sbin/iptables-legacy

# Now, close extraneous file descriptors.
pushd /proc/self/fd >/dev/null
for FD in *
do
	case "$FD" in
	# Keep stdin/stdout/stderr
	[012])
		;;
	# Nuke everything else
	*)
		eval exec "$FD>&-"
		;;
	esac
done
popd >/dev/null

# Ensure we have at least 4 loopback devices.
function ensure_loopback_device() {
  DEVICE_NUMBER="$1"
  DEVICE_NAME="/dev/loop$DEVICE_NUMBER"
  if [ -b "$DEVICE_NAME" ]; then
    return 0
  fi

  if ! mknod -m660 "$DEVICE_NAME" b 7 "$DEVICE_NUMBER"; then
    echo "Failed to create $DEVICE_NAME."
    return 1
  fi

  return 0
}

LOOP_A=$(losetup -f)
LOOP_A=${LOOP_A#/dev/loop}
LOOP_B=$(expr $LOOP_A + 1)
LOOP_C=$(expr $LOOP_B + 1)
LOOP_D=$(expr $LOOP_C + 1)

ensure_loopback_device $LOOP_A
ensure_loopback_device $LOOP_B
ensure_loopback_device $LOOP_C
ensure_loopback_device $LOOP_D

# If a pidfile is still around (for example after a container restart),
# delete it so that docker can start.
rm -rf /var/run/docker.pid

# Set MTU to GCE MTU
# https://cloud.google.com/compute/docs/troubleshooting#packetfragmentation
DOCKER_OPTS="$DOCKER_OPTS --mtu=1460"

# cgroup v2: enable nesting
if [ -f /sys/fs/cgroup/cgroup.controllers ]; then
        echo "enabling cgroup controls for dind"
	# move the processes from the root group to the /init group,
	# otherwise writing subtree_control fails with EBUSY.
	# An error during moving non-existent process (i.e., "cat") is ignored.
	mkdir -p /sys/fs/cgroup/init
	xargs -rn1 < /sys/fs/cgroup/cgroup.procs > /sys/fs/cgroup/init/cgroup.procs || :
	# enable controllers
	sed -e 's/ / +/g' -e 's/^/+/' < /sys/fs/cgroup/cgroup.controllers \
		> /sys/fs/cgroup/cgroup.subtree_control
fi

echo 'DOCKER_OPTS="'$DOCKER_OPTS'"' >>/etc/default/docker

# Last, start the docker service and wait for the daemon to become available.
echo "Starting docker service"
service docker start &> /dev/null

(( timeout = 60 + SECONDS ))
until docker info >/dev/null 2>&1
do
    if (( SECONDS >= timeout )); then
	echo 'Timed out trying to connect to internal docker host.' >&2
	break
    fi
    sleep 1
done

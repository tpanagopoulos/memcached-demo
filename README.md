 
### Memcached expiration issue demo

This is a sample application to demonstrate cache expiration issues with memcached.

Specifically, memcached seems to return items after their expiration time has passed.
The conditions are not specific, however, the root cause seems to be increased load.


## Run memcached

    docker run -p 11211:11211 --name my-memcache -d memcached memcached:alpine -m 64

## Execute script

    node src/main.js 
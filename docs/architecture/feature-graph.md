# Feature Dependency Graph

```
[ Domain Contracts (@krishios/shared) ]
                  |
         +--------+--------+
         |                 |
         v                 v
 [ Hydrology & NRV ]  [ Dexie v2 Offline DB ]
         |                 |
         |                 v
         |        [ Sync Outbox Engine ]
         |                 |
         +--------+--------+
                  |
                  v
       [ Edge Vision & Voice ]
                  |
                  v
        [ Client UI & PWA Shell ]
                  ^
                  |
       [ Minimal Secure Gateway ] <---- [ GitHub Actions Pipelines ]
```


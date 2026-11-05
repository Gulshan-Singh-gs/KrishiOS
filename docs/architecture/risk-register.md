# Risk Register

| Risk ID | Category | Description | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | Technical | IndexedDB quota eviction on low-storage Android devices | High | Medium | Implement persistent storage request (`navigator.storage.persist()`) and quota monitoring with automated cleanup of non-essential cached assets. |
| **RSK-02** | Security | Tampered client payloads claiming unverified Mandi prices or false diagnoses | High | Medium | Zero-trust gateway: Central database rejects client-asserted verified prices. All shared datasets originate strictly from authenticated GitHub Actions pipeline releases. |
| **RSK-03** | Scientific | Missing weather telemetry producing incorrect FAO-56 irrigation suggestions | Critical | High | Implement strict FAO-56 Annex missing-data procedures, flag confidence level, and clearly state assumptions to the farmer. |
| **RSK-04** | Performance | Heavy TFLite model causing UI thread freeze or Out-Of-Memory on entry-level Android devices | High | Medium | Execute vision inference inside dedicated Web Workers. Require Laplacian blur and image-quality filtering before running inference. |


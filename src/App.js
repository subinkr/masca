import { useEffect } from "react";
import "./App.css";
import { enableMasca, isError } from "@blockchain-lab-um/masca-connector";

function App() {
    useEffect(() => {
        runMasca();
    }, []);

    const runMasca = async () => {
        // Connect the user and get the address of his current account
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        const address = accounts[0];

        // Enable Masca
        const enableResult = await enableMasca(address, {
            snapId: "npm:@blockchain-lab-um/masca",
            version: "1.2.0-beta.2",
        });

        // // Check if there was an error and handle it accordingly
        // if (isError(enableResult)) {
        //     // Error message is available under error
        //     console.error(enableResult.error);
        // }

        // Now get the Masca API object
        const api = await enableResult.data.getMascaApi();
        await api.setCurrentAccount({
            account: address,
        });
        console.log(api);

        const payload = {
            type: ["VerifiableCredential", "Food"],
            credentialSubject: {
                id: "did:web:naegift.subin.kr/1",
                category: "Chicken",
                image: "https://s3.amazonaws.com/",
                shop: "BBQ",
                name: "황금올리브",
                description: "신선한 올리브유에서 튀긴 건강한 치킨",
            },
            credentialSchema: {
                id: "https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json",
                type: "JsonSchemaValidator2018",
            },
            // expirationDate: new Date(),
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                {
                    id: "https://example.com/schemas/test-credential/1.0/ld-context.json",
                    type: "http://www.w3.org/ns/json-ld#context",
                    name: "test-credential",
                    version: "1.0",
                    description: "테스트 Credential 컨텍스트",
                    properties: {
                        accomplishmentType:
                            "https://example.com/schemas/test-credential/1.0/accomplishmentType",
                        expirationDate:
                            "https://example.com/schemas/test-credential/1.0/expirationDate",
                    },
                },
            ],
        };

        // VC 생성
        const res = await api.createCredential({
            minimalUnsignedCredential: payload,
            proofFormat: "EthereumEip712Signature2021",
            options: {
                save: true,
                store: ["snap"],
            },
        });
        console.log(res);

        // VC 조회
        let vcs = await api.queryCredentials();
        console.log(vcs);
        const vp = await api.createPresentation({
            vcs: [res.data],
            proofFormat: "EthereumEip712Signature2021",
        });
        console.log("vp");
        console.log(vp);
        console.log(
            JSON.parse(vp.data.verifiableCredential[0]).credentialSubject.id
        );

        // VC 검증
        const vpRes = await api.verifyData({
            presentation: vp.data,
        });
        console.log(res.data);
        console.log(vp.data);
        console.log(vpRes);

        // VC 삭제
        await api.deleteCredential(vcs.data[vcs.data.length - 1].metadata.id, {
            store: ["snap"],
        });

        vcs = await api.queryCredentials();
        console.log(vcs);
    };

    return <div className="App"></div>;
}

export default App;

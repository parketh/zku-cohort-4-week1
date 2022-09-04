const { expect, assert } = require("chai")
const { ethers } = require("hardhat")
const { groth16, plonk } = require("snarkjs")

const wasm_tester = require("circom_tester").wasm

const F1Field = require("ffjavascript").F1Field
const Scalar = require("ffjavascript").Scalar
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617")
const Fr = new F1Field(exports.p)

function unstringifyBigInts(o) {
    if (typeof o == "string" && /^[0-9]+$/.test(o)) {
        return BigInt(o)
    } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
        return BigInt(o)
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts)
    } else if (typeof o == "object") {
        if (o === null) return null
        const res = {}
        const keys = Object.keys(o)
        keys.forEach((k) => {
            res[k] = unstringifyBigInts(o[k])
        })
        return res
    } else {
        return o
    }
}

describe("HelloWorld", function () {
    this.timeout(100000000)
    let Verifier
    let verifier

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier")
        verifier = await Verifier.deploy()
        await verifier.deployed()
    })

    it("Circuit should multiply two numbers correctly", async function () {
        // Load circuit
        const circuit = await wasm_tester("contracts/circuits/HelloWorld.circom")

        // Define input signals to circuit
        const INPUT = {
            a: 2,
            b: 3,
        }

        // Calculate witness based on circuit and specified inputs
        const witness = await circuit.calculateWitness(INPUT, true)

        //console.log(witness);

        // Checks that the witness is valid (i.e. produces the right outputs)
        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1))) // Not sure what this line does
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(6)))
    })

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        // Create groth16 proof
        const { proof, publicSignals } = await groth16.fullProve(
            { a: "2", b: "3" },
            "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm",
            "contracts/circuits/HelloWorld/circuit_final.zkey"
        )

        console.log("2x3 =", publicSignals[0])

        // Create calldata for Solidity contract from proof
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals)

        const argv = calldata
            .replace(/["[\]\s]/g, "")
            .split(",")
            .map((x) => BigInt(x).toString())

        const a = [argv[0], argv[1]]
        const b = [
            [argv[2], argv[3]],
            [argv[4], argv[5]],
        ]
        const c = [argv[6], argv[7]]
        const Input = argv.slice(8)

        // Check that the proof can be verified using these inputs
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true
    })
    it("Should return false for invalid proof", async function () {
        // Define an invalid proof
        let a = [0, 0]
        let b = [
            [0, 0],
            [0, 0],
        ]
        let c = [0, 0]
        let d = [0]

        // Expect that the proof should fail
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false
    })
})

describe("Multiplier3 with Groth16", function () {
    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("Multiplier3Verifier")
        verifier = await Verifier.deploy()
        await verifier.deployed()
    })

    it("Circuit should multiply three numbers correctly", async function () {
        // Load circuit
        const circuit = await wasm_tester("contracts/circuits/Multiplier3.circom")

        // Define input signals to circuit
        const INPUT = {
            a: 2,
            b: 3,
            c: 4,
        }

        // Calculate witness based on circuit and specified inputs
        const witness = await circuit.calculateWitness(INPUT, true)

        //console.log(witness);

        // Checks that the witness is valid (i.e. produces the right outputs)
        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1))) // Not sure what this line does
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(24)))
    })

    it("Should return true for correct proof", async function () {
        // Create groth16 proof
        const { proof, publicSignals } = await groth16.fullProve(
            { a: "2", b: "3", c: "4" },
            "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm",
            "contracts/circuits/Multiplier3/circuit_final.zkey"
        )

        console.log("2x3x4 =", publicSignals[0])

        // Create calldata for Solidity contract from proof
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals)

        const argv = calldata
            .replace(/["[\]\s]/g, "")
            .split(",")
            .map((x) => BigInt(x).toString())

        const a = [argv[0], argv[1]]
        const b = [
            [argv[2], argv[3]],
            [argv[4], argv[5]],
        ]
        const c = [argv[6], argv[7]]
        const Input = argv.slice(8)

        // Check that the proof can be verified using these inputs
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true
    })

    it("Should return false for invalid proof", async function () {
        // Define an invalid proof
        let a = [0, 0]
        let b = [
            [0, 0],
            [0, 0],
        ]
        let c = [0, 0]
        let d = [0]

        // Expect that the proof should fail
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false
    })
})

describe("Multiplier3 with PLONK", function () {
    let Verifier
    let verifier

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("PlonkVerifier")
        verifier = await Verifier.deploy()
        await verifier.deployed()
    })

    it("Circuit should multiply three numbers correctly", async function () {
        // Load circuit
        const circuit = await wasm_tester("contracts/circuits/Multiplier3.circom")

        // Define input signals to circuit
        const INPUT = {
            a: 2,
            b: 3,
            c: 4,
        }

        // Calculate witness based on circuit and specified inputs
        const witness = await circuit.calculateWitness(INPUT, true)

        //console.log(witness);

        // Checks that the witness is valid (i.e. produces the right outputs)
        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1))) // Not sure what this line does
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(24)))
    })

    it("Should return true for correct proof", async function () {
        const { proof, publicSignals } = await plonk.fullProve(
            { a: "2", b: "3", c: "4" },
            "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm",
            "contracts/circuits/Multiplier3_plonk/circuit_final.zkey"
        )
        console.log("2x3x4 =", publicSignals[0])

        const editedPublicSignals = unstringifyBigInts(publicSignals)
        const editedProof = unstringifyBigInts(proof)
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals)

        const argv = calldata.replace(/["[\]\s]/g, "").split(",")
        expect(await verifier.verifyProof(argv[0], [argv[1]])).to.be.true
    })

    it("Should return false for invalid proof", async function () {
        // Expect that the proof should fail
        expect(await verifier.verifyProof([0], [0])).to.be.false
    })
})

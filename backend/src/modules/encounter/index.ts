import { encounterInfo } from "@/dto/encounterInfo";
import { db } from "@/repository/database";
import dayjs from "dayjs";
import { Router } from "express";

export const encounterRouter = Router();

encounterRouter.get("/", async (req, res) => {
    try {
        const encounter = await db.encounter.findMany();
        res.status(200).json(encounter);
    } catch (error) {
        res.status(500).json("Internal Server Error");
    }
});

encounterRouter.get("/:transactionNumber", async (req, res) => {
    try {
        const { transactionNumber } = req.params;
        const encounter = await db.encounter.findUnique({
            where: { transactionNumber: transactionNumber },
        });

        if (encounter) {
            const patientExists = await db.patient.findUnique({
                where: { hospitalNumber: encounter?.patientHospitalNumber },
            });

            if (patientExists) {
                const returnData = {
                    transactionNumber: encounter.transactionNumber,
                    visitDate: dayjs(encounter.visitDate).startOf("day").format("YYYY-MM-DD"),
                    physicalExamination: encounter.physicalExamination,
                    diagnosis: encounter?.diagnosis,
                    presentIllness: encounter?.presentIllness,
                    patientHospitalNumber: encounter?.patientHospitalNumber,
                    patient: {
                        firstName: patientExists.firstName,
                        hospitalNumber: patientExists.hospitalNumber,
                        lastName: patientExists.lastName,
                    }
                };
                res.status(200).json(returnData);
            }
        } else {
            res.status(404).json("Not Found");
        }
    } catch (error) {
        res.status(500).json("Internal Server Error");
    }
});

encounterRouter.post("/", async (req, res) => {
    try {
        const createEncounter: encounterInfo = req.body;

        // Validate that patient exists
        const patientExists = await db.patient.findUnique({
            where: { hospitalNumber: createEncounter.patientHospitalNumber },
        });

        if (!patientExists) {
            return res.status(404).json(`Patient with hospitalNumber ${createEncounter.patientHospitalNumber} not found.`);
        }

        // Create the encounter
        const encounter = await db.encounter.create({
            data: createEncounter,
        });

        res.status(201).json({
            message: "Encounter created successfully",
            data: encounter,
        });
    } catch (error) {
        res.status(500).json("Internal Server Error");
    }
});

encounterRouter.put("/:transactionNumber", async (req, res) => {
    try {
        const { transactionNumber } = req.params;
        const {
            transactionNumber: bodyTransactionNumber,
            visitDate,
            physicalExamination,
            diagnosis,
            presentIllness,
            patientHospitalNumber
        } = req.body;

        // Validate that the encounter exists
        const encounterExists = await db.encounter.findUnique({
            where: { transactionNumber },
        });

        if (!encounterExists) {
            return res.status(404).json({ error: `Encounter with transaction number ${transactionNumber} not found.` });
        }

        // Validate that the patient exists
        if (patientHospitalNumber) {
            const patientExists = await db.patient.findUnique({
                where: { hospitalNumber: patientHospitalNumber },
            });

            if (!patientExists) {
                return res.status(404).json({ error: `Patient with hospital number ${patientHospitalNumber} not found.` });
            }
        }

        // Validate transaction number mismatch
        if (bodyTransactionNumber && bodyTransactionNumber !== transactionNumber) {
            throw new Error("Transaction number mismatch between URL parameter and request body.");
        }

        // Update the encounter
        const updatedEncounter = await db.encounter.update({
            where: { transactionNumber },
            data: {
                visitDate: visitDate ? new Date(visitDate) : encounterExists.visitDate,
                physicalExamination: physicalExamination ?? encounterExists.physicalExamination,
                diagnosis: diagnosis ?? encounterExists.diagnosis,
                presentIllness: presentIllness ?? encounterExists.presentIllness,
                patientHospitalNumber: patientHospitalNumber ?? encounterExists.patientHospitalNumber,
            },
        });

        res.status(204).json({
            message: `Successfully updated encounter with transaction number: ${transactionNumber}`,
            data: updatedEncounter,
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


encounterRouter.all("/", async (req, res) => {
    res.status(405).send("Method Not Allowed");
});
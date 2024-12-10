import { patientInfo } from "@/dto/patientInfo";
import { db } from "@/repository/database";
import { Router } from "express";

export const patientRouter = Router();

patientRouter.get("/", async (req, res) => {
    try {
        const patients = await db.patient.findMany();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json("Internal Server Error");
    }
});

patientRouter.get("/:hospitalNumber", async (req, res) => {
    try {
        const { hospitalNumber } = req.params;
        const patient = await db.patient.findUnique({
            where: { hospitalNumber: hospitalNumber },
        });

        if (patient) {
            res.status(200).json(patient);
        } else {
            res.status(404).json("Not Found");
        }
    } catch (error) {
        res.status(500).json("Internal Server Error");
    }
});

patientRouter.post("/", async (req, res) => {
    try {
        const createPatient: patientInfo = req.body;

        // Create the patient
        const patient = await db.patient.create({
            data: createPatient,
        });
        res.status(201).json({
            message: 'New patient created',
            data: patient
        });
    } catch (error) {
        res.status(500).json("Internal Server Error");
    }
});

patientRouter.put("/:hospitalNumber", async (req, res) => {
    try {
        const { hospitalNumber } = req.params;
        const { hospitalNumber: bodyHospitalNumber, firstName, lastName, birthday, sex } = req.body;

        // Validation check for hospitalNumber mismatch
        if (bodyHospitalNumber && bodyHospitalNumber !== hospitalNumber) {
            throw new Error("Hospital number mismatch between URL parameter and request body.");
        }

        const patientExists = await db.patient.findUnique({
            where: { hospitalNumber: hospitalNumber },
        });
        if (!patientExists) {
            return res.status(404).json(`Patient with hospitalNumber ${hospitalNumber} not found.`);
        }

        // Update patient
        const updatePatient = await db.patient.update({
            where: { hospitalNumber: hospitalNumber },
            data: {
                hospitalNumber,
                firstName,
                lastName,
                birthday: new Date(birthday),
                sex,
            },
        });

        res.status(204).json({
            message: `Updated patient with ID: ${hospitalNumber}`,
            data: updatePatient,
        });

    } catch (error) {
        res.status(500).json("Internal Server Error");
    }
});

patientRouter.all("/", async (req, res) => {
    res.status(405).send("Method Not Allowed");
});
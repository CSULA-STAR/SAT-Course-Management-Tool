"use client";

import { useState, useEffect } from "react";
import { Description, Fieldset, Label } from "@/components/fieldset";
import { Select } from "@/components/select";
import { Input } from "@/components/input";
import * as Headless from "@headlessui/react";
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";

interface School {
    _id: string;
    id: string; // This is the school s_id used as the option value.
    name: string;
}

const programsApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/programs`;
const schoolsApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/schools`;

export default function Page() {
    const [departmentName, setDepartmentName] = useState("");
    const [programName, setProgramName] = useState("");
    const [selectedSchool, setSelectedSchool] = useState("");
    const [schools, setSchools] = useState<School[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    // Fetch the list of schools from the API
    useEffect(() => {
        fetch(schoolsApiUrl)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch schools.");
                }
                return res.json();
            })
            .then((data: School[]) => {
                setSchools(data);
            })
            .catch((err) => {
                console.error("Error fetching schools:", err);
                setError("Error fetching schools.");
                setShowErrorDialog(true);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!programName.trim()) {
            setError("Program name is required.");
            setShowErrorDialog(true);
            return;
        }

        if (!departmentName.trim()) {
            setError("Department name is required.");
            setShowErrorDialog(true);
            return;
        }

        if (!selectedSchool) {
            setError("Please select an institution.");
            setShowErrorDialog(true);
            return;
        }

        try {
            const res = await fetch(programsApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: programName,
                    department: departmentName,
                    s_id: selectedSchool
                })
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || "Failed to add program.");
            }

            setShowSuccessDialog(true);
            // Optionally clear the form fields
            setProgramName("");
            setDepartmentName("");
            setSelectedSchool("");
        } catch (err) {
            console.error("Error adding program:", err);
            setError("Failed to add program.");
            setShowErrorDialog(true);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <Fieldset>
                    <div
                        data-slot="control"
                        className="grid grid-cols-1 mt-10 items-center gap-x-4 gap-y-6 sm:grid-cols-3"
                    >
                        <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                            <Label>Program name</Label>
                            <Input
                                className="mt-3 sm:col-span-2 sm:mt-0"
                                name="program_name"
                                value={programName}
                                onChange={(e) => setProgramName(e.target.value)}
                                required
                            />
                            <Description>e.g. Electrical Engineering</Description>
                        </Headless.Field>
                        <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                            <Label>Department</Label>
                            <Input
                                className="mt-3 sm:col-span-2 sm:mt-0"
                                name="department_name"
                                value={departmentName}
                                onChange={(e) => setDepartmentName(e.target.value)}
                            />
                            <Description>e.g. EE (The department abbreviation.)</Description>
                        </Headless.Field>
                        <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                            <Label>Institution</Label>
                            <Select
                                className="mt-3 sm:col-span-2 sm:mt-0"
                                name="institution"
                                value={selectedSchool}
                                onChange={(e) => setSelectedSchool(e.target.value)}
                            >
                                <option value="">Select an institution</option>
                                {schools.map((school) => (
                                    <option key={school._id} value={school.id}>
                                        {school.name}
                                    </option>
                                ))}
                            </Select>
                            <Description>
                                Select the institution where the program from. If your institution is not listed, please add it under the{" "}
                                <a href="/institutions" className="text-blue-500 underline">
                                    Institution
                                </a>{" "}
                                tab.
                            </Description>
                        </Headless.Field>
                    </div>
                </Fieldset>
                <div className="flex justify-end mt-4 space-x-4">
                    <button
                        type="submit"
                        className="w-32 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add
                    </button>
                    <button
                        type="reset"
                        onClick={() => {
                            setProgramName("");
                            setDepartmentName("");
                            setSelectedSchool("");
                        }}
                        className="w-32 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Clear
                    </button>
                    <a
                        href="/programs"
                        className="w-32 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 text-center"
                    >
                        Cancel
                    </a>
                </div>
            </form>

            {/* Error Dialog */}
            <Dialog open={showErrorDialog} onClose={setShowErrorDialog}>
                <DialogTitle>Error</DialogTitle>
                <DialogDescription>{error}</DialogDescription>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowErrorDialog(false);
                            setError(null);
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onClose={setShowSuccessDialog}>
                <DialogTitle>Success</DialogTitle>
                <DialogDescription>
                    Program added successfully.
                </DialogDescription>
                <DialogActions>
                    <Button onClick={() => setShowSuccessDialog(false)}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

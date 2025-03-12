"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Select } from "@/components/select";
import * as Headless from "@headlessui/react";
import { Description, Fieldset, Label } from "@/components/fieldset";
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";

const programsApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/programs`;
const schoolsApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/schools`;

interface SchoolData {
    _id: string;
    name: string;
    id: string; // This is the school s_id
}

// interface Program {
//     _id: string;
//     s_id: string;
//     name: string;
//     department: string;
//     school: SchoolData;
//     id: string;
// }

export default function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const programId = use(params).id;
    const router = useRouter();
    const [programName, setProgramName] = useState("");
    const [department, setDepartment] = useState("");
    const [selectedSchool, setSelectedSchool] = useState("");
    const [schools, setSchools] = useState<SchoolData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    // Fetch program details and prepopulate fields.
    useEffect(() => {
        if (!programId) return;
        fetch(`${programsApiUrl}/${programId}`)
            .then((res) => {
                if (res.status === 404 || res.status === 500) {
                    router.push("/programs");
                    return Promise.reject("Program not found or server error.");
                }
                if (!res.ok) {
                    throw new Error("Failed to fetch program details.");
                }
                return res.json();
            })
            .then((data) => {
                // API returns an array; use the first element if necessary.
                const program = Array.isArray(data) ? data[0] : data;
                setProgramName(program.name);
                setDepartment(program.department);
                setSelectedSchool(program.school.id);
            })
            .catch((err) => {
                console.error("Error fetching program details:", err);
            });
    }, [programId, router]);

    // Fetch the list of schools for the Institution dropdown.
    useEffect(() => {
        fetch(schoolsApiUrl)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch schools.");
                }
                return res.json();
            })
            .then((data: SchoolData[]) => {
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

        if (!department.trim()) {
            setError("Department is required.");
            setShowErrorDialog(true);
            return;
        }

        if (!selectedSchool) {
            setError("Please select an institution.");
            setShowErrorDialog(true);
            return;
        }

        try {
            const res = await fetch(`${programsApiUrl}/${programId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: programName,
                    department,
                    s_id: selectedSchool,
                }),
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || "Failed to update program.");
            }

            setShowSuccessDialog(true);
        } catch (err) {
            console.error("Error updating program:", err);
            setError("Failed to update program.");
            setShowErrorDialog(true);
        }
    };

    if (!programId) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <Fieldset>
                    <div
                        data-slot="control"
                        className="grid grid-cols-1 mt-10 items-center gap-x-4 gap-y-6 sm:grid-cols-3"
                    >
                        <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                            <Label>Program Name</Label>
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
                                name="department"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            />
                            <Description>e.g. EE (Department abbreviation)</Description>
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
                                Select the institution from the list. If your institution is not listed, please add it under the{" "}
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
                        Update
                    </button>
                    <a
                        href="/programs"
                        className="w-32 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 text-center"
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
                    Program updated successfully.
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

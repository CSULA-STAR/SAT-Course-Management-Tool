"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Fieldset, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import * as Headless from "@headlessui/react";
import {
    Dialog,
    DialogActions,
    DialogDescription,
    DialogTitle,
} from "@/components/dialog";
import { Button } from "@/components/button";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/schools`;

export default function EditSchoolPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const schoolId = use(params).id;
    const router = useRouter();
    const [schoolName, setSchoolName] = useState("");
    const [location, setLocation] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        if (!schoolId) return;
        fetch(`${apiUrl}/${schoolId}`)
            .then((res) => {
                if (res.status === 404 || res.status === 500) {
                    router.push("/institutions");
                    return Promise.reject("School not found or server error.");
                }
                if (!res.ok) {
                    throw new Error("Failed to fetch school details.");
                }
                return res.json();
            })
            .then((data) => {
                setSchoolName(data.name);
                setLocation(data.location);
            })
            .catch((err) => {
                console.error("Error fetching school details:", err);
            });
    }, [schoolId, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!schoolName.trim()) {
            setError("School name is required.");
            setShowErrorDialog(true);
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/${schoolId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: schoolName, location }),
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || "Failed to update school.");
            }

            setShowSuccessDialog(true);
        } catch (err) {
            console.error("Error updating school:", err);
            setError("Failed to update school.");
            setShowErrorDialog(true);
        }
    };

    if (!schoolId) {
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
                            <Label>School name</Label>
                            <Input
                                className="mt-3 sm:col-span-2 sm:mt-0"
                                name="school_name"
                                value={schoolName}
                                onChange={(e) =>
                                    setSchoolName(e.target.value)
                                }
                                required
                            />
                        </Headless.Field>
                        <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                            <Label>Location</Label>
                            <Input
                                className="mt-3 sm:col-span-2 sm:mt-0"
                                name="location"
                                value={location}
                                onChange={(e) =>
                                    setLocation(e.target.value)
                                }
                            />
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
                        href="/institutions"
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
                    School updated successfully.
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

"use client";

import { useState, useEffect } from "react";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/programs`;

interface SchoolData {
    _id: string;
    name: string;
    id: string;
}

interface Program {
    _id: string;
    s_id: string;
    name: string;
    department: string;
    school: SchoolData;
    id: string;
}

function TableComponent({
    programs,
    openDeleteDialog,
}: {
    programs: Program[];
    openDeleteDialog: (id: string) => void;
}) {
    return (
        <Table grid striped className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
            <TableHead>
            <TableRow>
                <TableHeader>Program Name</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Insitution (Transfer from)</TableHeader>
                <TableHeader></TableHeader>
            </TableRow>
            </TableHead>
            <TableBody>
                {programs.map((program) => (
                    <TableRow key={program._id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">{program.name}</TableCell>
                        <TableCell>{program.department}</TableCell>
                        <TableCell>{program.school.name}</TableCell>
                        <TableCell>
                            <div className="-mx-3 -my-1.5 sm:-mx-2.5">
                                <Dropdown>
                                    <DropdownButton plain aria-label="More options">
                                        <EllipsisHorizontalIcon />
                                    </DropdownButton>
                                    <DropdownMenu anchor="bottom end">
                                        <DropdownItem href={`/programs/edit/${program._id}`}>
                                            Edit
                                        </DropdownItem>
                                        <DropdownItem onClick={() => openDeleteDialog(program._id)}>
                                            Delete
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

        
    );
}

export default function Page() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [showDeleteErrorDialog, setShowDeleteErrorDialog] = useState(false);

    useEffect(() => {
        fetch(apiUrl)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch programs.");
                }
                return res.json();
            })
            .then((data: Program[]) => {
                setPrograms(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching programs:", err);
                setError("Error fetching programs.");
                setLoading(false);
            });
    }, []);

    const openDeleteDialog = (id: string) => {
        setSelectedProgramId(id);
        setIsOpen(true);
    };

    const onDelete = async (id: string) => {
        try {
            const res = await fetch(`${apiUrl}/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Failed to delete program.");
            }
            setPrograms((prev) => prev.filter((program) => program._id !== id));
        } catch (err) {
            console.error("Error deleting program:", err);
            setDeleteError("Failed to delete program.");
            setShowDeleteErrorDialog(true);
        }
    };

    if (loading) {
        return <div>Loading programs...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="p-4">
            <TableComponent programs={programs} openDeleteDialog={openDeleteDialog} />

            <Dialog open={isOpen} onClose={setIsOpen}>
                <DialogTitle>Remove Program</DialogTitle>
                <DialogDescription>
                    Are you sure you want to remove this program? This action cannot be undone.
                </DialogDescription>
                <DialogActions>
                    <Button plain onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (selectedProgramId !== null) {
                                onDelete(selectedProgramId);
                            }
                            setIsOpen(false);
                        }}
                    >
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Error Dialog for delete failure */}
            <Dialog open={showDeleteErrorDialog} onClose={() => setShowDeleteErrorDialog(false)}>
                <DialogTitle>Error</DialogTitle>
                <DialogDescription>{deleteError}</DialogDescription>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowDeleteErrorDialog(false);
                            setDeleteError(null);
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

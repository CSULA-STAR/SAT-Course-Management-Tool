"use client";

import { useState, useEffect } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/schools`;

interface School {
id: string;
name: string;
location: string;
}

function TableComponent({ 
    schools, 
    onDelete,
}: { 
    schools: School[]; 
    onDelete: (id: string) => void 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

    const openDeleteDialog = (id: string) => {
        setSelectedSchoolId(id);
        setIsOpen(true);
    };

    return (
        <>
        <Table grid striped className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
            <TableHead>
            <TableRow>
                <TableHeader>School Name</TableHeader>
                <TableHeader></TableHeader>
            </TableRow>
            </TableHead>
            <TableBody>
            {schools.map((school) => (
                <TableRow key={school.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell>
                    <div className="-mx-3 -my-1.5 sm:-mx-2.5">
                    <Dropdown>
                        <DropdownButton plain aria-label="More options">
                            <EllipsisHorizontalIcon />
                        </DropdownButton>
                        <DropdownMenu anchor="bottom end">
                            <DropdownItem href={`/institutions/edit/${school.id}`}>Edit</DropdownItem>
                            <DropdownItem onClick={() => openDeleteDialog(school.id)}>Delete</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    </div>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>

        <Dialog open={isOpen} onClose={setIsOpen}>
            <DialogTitle>Remove Institution</DialogTitle>
            <DialogDescription>
            Are you sure you want to remove this institution? This action cannot be undone.
            </DialogDescription>
            <DialogActions>
            <Button plain onClick={() => setIsOpen(false)}>
                Cancel
            </Button>
            <Button
                onClick={() => {
                if (selectedSchoolId) {
                    onDelete(selectedSchoolId);
                }
                setIsOpen(false);
                }}
            >
                Remove
            </Button>
            </DialogActions>
        </Dialog>
        </>
    );
}

export default function Page() {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [showDeleteErrorDialog, setShowDeleteErrorDialog] = useState<boolean>(false);

    const fetchSchools = () => {
        fetch(apiUrl)
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to fetch schools.");
            }
            return res.json();
        })
        .then((data: School[]) => {
            setSchools(data);
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error fetching schools:", err);
            setError("Error fetching schools.");
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    // Handle delete action: send DELETE request and update the UI.
    const handleDelete = (id: string) => {
        fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
        })
        .then((res) => {
            if (!res.ok) {
            throw new Error("Failed to delete school.");
            }
            setSchools((prev) => prev.filter((school) => school.id !== id));
        })
        .catch((err) => {
            console.error("Error deleting school:", err);
            setDeleteError("Failed to delete school.");
            setShowDeleteErrorDialog(true);
        });
    };

    if (loading) {
        return <div>Loading schools...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="p-4">
        <TableComponent schools={schools} onDelete={handleDelete} />

        {/* Error Dialog for delete failure */}
        <Dialog open={showDeleteErrorDialog} onClose={setShowDeleteErrorDialog}>
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

"use client";

import { useState, useEffect } from "react";
import { Description, Fieldset, Label } from "@/components/fieldset";
import { Select } from "@/components/select";
import { Input } from "@/components/input";
import { Checkbox, CheckboxField, CheckboxGroup } from "@/components/checkbox";
import * as Headless from "@headlessui/react";
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";

interface School {
    _id: string;
    id: string;
    name: string;
}

interface Program {
    department: string;
    name: string;
}

const coursesApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/courses`;
const schoolsApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/schools`;
const programsApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/programs`;

export default function Page() {
    const [courseName, setCourseName] = useState("");
    const [courseCode, setCourseCode] = useState<string[]>([]);
    const [equivalentTo, setEquivalentTo] = useState<string[]>([]);
    const [credits, setCredits] = useState("");
    const [category, setCategory] = useState("");
    const [departments, setDepartments] = useState<string[]>([]);
    const [selectedSchool, setSelectedSchool] = useState("");
    const [schools, setSchools] = useState<School[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        fetch(schoolsApiUrl)
            .then((res) => res.json())
            .then((data: School[]) => setSchools(data))
            .catch((err) => {
                console.error("Error fetching schools:", err);
                setError("Error fetching schools.");
                setShowErrorDialog(true);
            });
    }, []);

    useEffect(() => {
        if (selectedSchool) {
            fetch(`${programsApiUrl}/${selectedSchool}`)
                .then((res) => res.json())
                .then((data: Program[]) => setPrograms(data))
                .catch((err) => console.error("Error fetching programs:", err));
        }
    }, [selectedSchool]);

    const toggleDepartmentSelection = (department: string) => {
        setDepartments((prev) =>
            prev.includes(department) ? prev.filter((dep) => dep !== department) : [...prev, department]
        );
    };

    const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCourseCode( value
            .replace(/[^a-zA-Z0-9, _-]/g, '')
            .split(',')
            .map(code => code.trimStart())
        );
    };

    const handleEquivalentToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEquivalentTo( value
            .replace(/[^a-zA-Z0-9, _-]/g, '')
            .split(',')
            .map(code => code.trimStart())
        );
    };
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!courseName.trim()) {
            setError("Course name is required.");
            setShowErrorDialog(true);
            return;
        }

        if (courseCode.length === 0) {
            setError("Course code is required.");
            setShowErrorDialog(true);
            return;
        } else {
            setCourseCode( courseCode
                .map(item => item.trim())
                .filter(item => item !== ""));
        }

        if (equivalentTo.length > 0) {
            setEquivalentTo(equivalentTo
                .map(item => item.trim())
                .filter(item => item !== ""));
        }

        if (!selectedSchool) {
            setError("Please select an institution.");
            setShowErrorDialog(true);
            return;
        }

        try {
            const res = await fetch(coursesApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    course_name: courseName,
                    course_code: courseCode,
                    equivalent_to: equivalentTo ? equivalentTo : [],
                    credits: Number(credits),
                    category: category,
                    department: departments,
                    s_id: selectedSchool
                })
            });

            if (!res.ok) {
                throw new Error("Failed to add course.");
            }

            setShowSuccessDialog(true);
            setCourseName("");
            setCourseCode([]);
            setEquivalentTo("");
            setCredits("");
            setCategory("");
            setDepartments([]);
            setSelectedSchool("");
        } catch (err) {
            console.error("Error adding course:", err);
            setError("Failed to add course.");
            setShowErrorDialog(true);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <Fieldset>
                    <div className="grid grid-cols-1 mt-10 items-center gap-x-4 gap-y-6 sm:grid-cols-3">
                        <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                            <Label>Course Name</Label>
                            <Input className="mt-3 sm:col-span-2 sm:mt-0" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
                            <Description>e.g. Introduction to Engineering</Description>
                        </Headless.Field>
                        <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                            <Label>Course Code</Label>
                            <Input className="mt-3 sm:col-span-2 sm:mt-0" value={courseCode.join(", ")} onChange={handleCourseCodeChange} required />
                            <Description>If the course has multiple codes, separate them with commas. e.g., ENGR 10, ENG 10</Description>
                        </Headless.Field>
                        <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                            <Label>Credits</Label>
                            <Input type="number" className="mt-3 sm:col-span-2 sm:mt-0" value={credits} onChange={(e) => setCredits(e.target.value)} required />
                            <Description>e.g. 3</Description>
                        </Headless.Field>
                        <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                            <Label>Category</Label>
                            <Input className="mt-3 sm:col-span-2 sm:mt-0" value={category} onChange={(e) => setCategory(e.target.value)} />
                            <Description>e.g. Technical Lower Division Major Courses</Description>
                        </Headless.Field>
                        <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                            <Label>Equivalent Course (CSULA Course)</Label>
                            <Input 
                                className="mt-3 sm:col-span-2 sm:mt-0" 
                                value={equivalentTo.join(", ")} 
                                onChange={handleEquivalentToChange} 
                            />
                            <Description>If the equivalent course has multiple codes, separate them with commas. For example: ENGR 10, ENG 10</Description>
                        </Headless.Field>
                        <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                            <Label>Institution (Transfer From)</Label>
                            <Select className="mt-3 sm:col-span-2 sm:mt-0" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                                <option value="">Select an institution</option>
                                {schools.map((school) => (
                                    <option key={school._id} value={school.id}>{school.name}</option>
                                ))}
                            </Select>
                            <Description>Select the institution from which this course is being transferred, and then choose the program.</Description>
                        </Headless.Field>
                        <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                            <Fieldset>
                                <Label>Program</Label>
                                <CheckboxGroup>
                                    {programs.map((program) => (
                                        <CheckboxField key={program.department}>
                                            <Checkbox
                                                name="departments"
                                                value={program.department}
                                                checked={departments.includes(program.department)}
                                                onChange={() => toggleDepartmentSelection(program.department)}
                                            />
                                            <Label>{`${program.department} (${program.name})`}</Label>
                                        </CheckboxField>
                                    ))}
                                </CheckboxGroup>
                            </Fieldset>

                        </Headless.Field>
                    </div>
                </Fieldset>

                <div className="flex justify-end mt-4 space-x-4">
                    <button type="submit" className="w-32 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Add</button>
                    <button type="reset" onClick={() => {
                        setCourseName("");
                        setCourseCode([]);
                        setCredits("");
                        setCategory("");
                        setDepartments([]);
                        setEquivalentTo([]);
                        setSelectedSchool("");
                    }} className="w-32 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700">Clear</button>
                    <a href="/courses" className="w-32 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 text-center">Cancel</a>
                </div>
            </form>
            <Dialog open={showErrorDialog} onClose={setShowErrorDialog}>
                <DialogTitle>Error</DialogTitle>
                <DialogDescription>{error}</DialogDescription>
                <DialogActions>
                    <Button onClick={() => { setShowErrorDialog(false); setError(null); }}>Confirm</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={showSuccessDialog} onClose={setShowSuccessDialog}>
                <DialogTitle>Success</DialogTitle>
                <DialogDescription>Course added successfully.</DialogDescription>
                <DialogActions>
                    <Button onClick={() => setShowSuccessDialog(false)}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

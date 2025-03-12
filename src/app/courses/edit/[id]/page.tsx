"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import * as Headless from "@headlessui/react";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Select } from "@/components/select";
import { Description, Fieldset, Label } from "@/components/fieldset";
import { Checkbox, CheckboxField, CheckboxGroup } from "@/components/checkbox";
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";

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

export default function Page({
params,
}: {
params: Promise<{ id: string }>
}) {
const courseId = use(params).id;
const router = useRouter();

const [courseName, setCourseName] = useState("");
const [courseCode, setCourseCode] = useState<string[]>([]);
const [equivalentTo, setEquivalentTo] = useState("");
const [credits, setCredits] = useState("");
const [category, setCategory] = useState("");
const [departments, setDepartments] = useState<string[]>([]);
const [selectedSchool, setSelectedSchool] = useState("");
const [schools, setSchools] = useState<School[]>([]);
const [programs, setPrograms] = useState<Program[]>([]);
const [error, setError] = useState<string | null>(null);
const [showErrorDialog, setShowErrorDialog] = useState(false);
const [showSuccessDialog, setShowSuccessDialog] = useState(false);

// Fetch the existing course details and prepopulate the fields.
useEffect(() => {
    if (!courseId) return;
    fetch(`${coursesApiUrl}/${courseId}`)
    .then((res) => {
        if (!res.ok) {
        router.push("/courses");
        return Promise.reject("Course not found or server error.");
        }
        return res.json();
    })
    .then((data) => {
        // Handle the API response which might be an array or an object.
        const course = Array.isArray(data) ? data[0] : data;
        setCourseName(course.course_name);
        setCourseCode(course.course_code);
        // Convert an array of equivalent course codes to a comma‐separated string.
        setEquivalentTo(Array.isArray(course.equivalent_to)
        ? course.equivalent_to.join(", ")
        : course.equivalent_to || ""
        );
        setCredits(course.credits ? String(course.credits) : "");
        setCategory(course.category);
        setDepartments(course.department);
        setSelectedSchool(course.s_id);
    })
    .catch((err) => {
        console.error("Error fetching course details:", err);
        setError("Error fetching course details.");
        setShowErrorDialog(true);
    });
}, [courseId, router]);

// Fetch the list of schools for the Institution dropdown.
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

// When an institution is selected, fetch its associated programs.
useEffect(() => {
    if (selectedSchool) {
    fetch(`${programsApiUrl}/${selectedSchool}`)
        .then((res) => res.json())
        .then((data: Program[]) => setPrograms(data))
        .catch((err) =>
        console.error("Error fetching programs:", err)
        );
    }
}, [selectedSchool]);

const toggleDepartmentSelection = (department: string) => {
    setDepartments((prev) =>
    prev.includes(department)
        ? prev.filter((dep) => dep !== department)
        : [...prev, department]
    );
};

const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCourseCode(
    value
        .replace(/[^a-zA-Z0-9, _-]/g, "")
        .split(",")
        .map((code) => code.trimStart())
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
        setCourseCode(
            courseCode.map((item) => item.trim()).filter((item) => item !== "")
        );
    }

    if (!selectedSchool) {
        setError("Please select an institution.");
        setShowErrorDialog(true);
        return;
    }

    try {
        const res = await fetch(`${coursesApiUrl}/${courseId}`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            course_name: courseName,
            course_code: courseCode,
            // Split the equivalentTo string by commas into an array of trimmed codes.
            equivalent_to: equivalentTo
                ? equivalentTo.split(",").map((code) => code.trim())
                : [],
            credits: Number(credits),
            category: category,
            department: departments,
            s_id: selectedSchool,
        }),
    });
        const responseData = await res.json();
        if (!res.ok) {
            throw new Error(responseData.error || "Failed to update course.");
        }
            setShowSuccessDialog(true);
    } catch (err) {
        console.error("Error updating course:", err);
        setError("Failed to update course.");
        setShowErrorDialog(true);
    }
};

if (!courseId) {
    return <div>Loading...</div>;
}

return (
    <>
    <form onSubmit={handleSubmit}>
        <Fieldset>
        <div className="grid grid-cols-1 mt-10 items-center gap-x-4 gap-y-6 sm:grid-cols-3">
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
            <Label>Course Name</Label>
            <Input
                className="mt-3 sm:col-span-2 sm:mt-0"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
            />
            <Description>e.g. Introduction to Engineering</Description>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
            <Label>Course Code</Label>
            <Input
                className="mt-3 sm:col-span-2 sm:mt-0"
                value={courseCode.join(", ")}
                onChange={handleCourseCodeChange}
                required
            />
            <Description>
                If the course has multiple codes, separate them with commas.
                e.g., ENGR 10, ENG 10
            </Description>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
            <Label>Credits</Label>
            <Input
                type="number"
                className="mt-3 sm:col-span-2 sm:mt-0"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                required
            />
            <Description>e.g. 3</Description>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
            <Label>Category</Label>
            <Input
                className="mt-3 sm:col-span-2 sm:mt-0"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            />
            <Description>
                e.g. Technical Lower Division Major Courses
            </Description>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
            <Label>Equivalent Course (CSULA Course)</Label>
            <Input
                className="mt-3 sm:col-span-2 sm:mt-0"
                value={equivalentTo}
                onChange={(e) => setEquivalentTo(e.target.value)}
            />
            <Description>
                If the equivalent course has multiple codes, separate them with commas.
                For example: ENGR 10, ENG 10
            </Description>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
            <Label>Institution (Transfer From)</Label>
            <Select
                className="mt-3 sm:col-span-2 sm:mt-0"
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
                Select the institution from which this course is being transferred,
                and then choose the program.
            </Description>
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
                        onChange={() =>
                        toggleDepartmentSelection(program.department)
                        }
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
        <button
            type="submit"
            className="w-32 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            Update
        </button>
        <a
            href="/courses"
            className="w-32 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 text-center"
        >
            Cancel
        </a>
        </div>
    </form>
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
    <Dialog open={showSuccessDialog} onClose={setShowSuccessDialog}>
        <DialogTitle>Success</DialogTitle>
        <DialogDescription>Course updated successfully.</DialogDescription>
        <DialogActions>
        <Button onClick={() => setShowSuccessDialog(false)}>Confirm</Button>
        </DialogActions>
    </Dialog>
    </>
);
}

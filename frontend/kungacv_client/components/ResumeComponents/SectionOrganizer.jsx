import React, { useMemo } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FiChevronDown, FiChevronUp, FiMenu } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@redux/hooks";
import { updateCustomization } from "@redux/resume/features";
import { ADD_CONTENT } from "@utils/Constants";

const dataBySection = {
    "Professional Experience": "professionalExperience",
    Skills: "skills",
    Languages: "languages",
    Projects: "projects",
    Interests: "interests",
    Certificates: "certificates",
    Education: "education",
    Courses: "courses",
    References: "references",
};

const SectionOrganizer = () => {
    const dispatch = useDispatch();
    const resume = useAppSelector((state) => state.persistedReducer.resume);
    const storedOrder = resume.customization?.layout?.contentArrangement || [];
    const available = useMemo(
        () => ADD_CONTENT.filter((section) => section.id !== "PERSONAL_INFO" && resume[dataBySection[section.title]]?.length > 0),
        [resume]
    );
    const sections = useMemo(() => {
        const storedIds = storedOrder.map((section) => section.id);
        const ordered = storedIds.map((id) => available.find((section) => section.id === id)).filter(Boolean);
        return [...ordered, ...available.filter((section) => !storedIds.includes(section.id))];
    }, [available, storedOrder]);

    const saveOrder = (nextSections) => {
        dispatch(updateCustomization({ key: "layout", value: { contentArrangement: nextSections, columnsArrangement: { left: nextSections } } }));
    };

    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= sections.length) return;
        const next = Array.from(sections);
        [next[index], next[target]] = [next[target], next[index]];
        saveOrder(next);
    };

    const handleDragEnd = (result) => {
        if (!result.destination || result.destination.index === result.source.index) return;
        const next = Array.from(sections);
        const [moved] = next.splice(result.source.index, 1);
        next.splice(result.destination.index, 0, moved);
        saveOrder(next);
    };

    if (!sections.length) return null;

    return (
        <section className="section-organizer" aria-labelledby="section-organizer-heading">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <p className="editor-eyebrow">Layout</p>
                    <h2 id="section-organizer-heading" className="mt-1 text-xl font-extrabold">Arrange your sections</h2>
                    <p className="mt-1 text-sm text-gray-500">Drag a section, or use the arrows to move it. Your preview updates instantly.</p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{sections.length} sections</span>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="resume-sections">
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                            {sections.map((section, index) => {
                                const Icon = section.icon;
                                return (
                                    <Draggable key={String(section.id)} draggableId={String(section.id)} index={index}>
                                        {(dragProvided, snapshot) => (
                                            <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} className={`section-organizer-row ${snapshot.isDragging ? "section-organizer-row-dragging" : ""}`}>
                                                <button type="button" className="section-drag-handle" aria-label={`Drag ${section.title}`} {...dragProvided.dragHandleProps}><FiMenu /></button>
                                                <span className="section-organizer-icon"><Icon /></span>
                                                <span className="grow text-sm font-bold">{section.title}</span>
                                                <div className="flex items-center gap-1">
                                                    <button type="button" className="section-move-button" aria-label={`Move ${section.title} up`} onClick={() => move(index, -1)} disabled={index === 0}><FiChevronUp /></button>
                                                    <button type="button" className="section-move-button" aria-label={`Move ${section.title} down`} onClick={() => move(index, 1)} disabled={index === sections.length - 1}><FiChevronDown /></button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </section>
    );
};

export default SectionOrganizer;

import { useAppSelector } from "@redux/hooks";
import { addReferences, removeReference, resetEditObj, resetPrevObj, setEditObj, setPrevObj, updateReferences } from "@redux/resume/features";
import React, { useEffect } from "react";
import { BsCheck2 } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { _parseEditObjPayload } from "@utils/helpers";
import { AVAILABLE_COMPONENTS, NULL_VALUE } from "@utils/Constants";

const References = ({ setCurrentComponent }) => {
    const dispatch = useDispatch();

    const { references, editObj = {}, prevObj = {} } = useAppSelector((state) => state.persistedReducer.resume);

    const handleAddOrUpdateReference = (payload = {}) => {
        if (!editObj.references) {
            dispatch(setEditObj({ key: "references", value: { ..._parseEditObjPayload(payload), id: references.length + 1 } }));
            dispatch(addReferences({ ...payload, id: references.length + 1 }));
        } else {
            dispatch(updateReferences({ ...editObj.references, ...payload }));
            dispatch(setEditObj({ key: "references", value: { ...(editObj?.references || {}), ..._parseEditObjPayload(payload) } }));
        }
    };

    const handleCancel = () => {
        if (!editObj.references) {
            setCurrentComponent(AVAILABLE_COMPONENTS.personalInfo);
            return;
        }

        if (!prevObj.references) {
            dispatch(removeReference({ id: editObj.references?.id }));
        } else {
            dispatch(updateReferences(prevObj.references));
        }

        dispatch(resetEditObj());
        dispatch(resetPrevObj());

        setCurrentComponent(AVAILABLE_COMPONENTS.personalInfo);
    };

    const handleSave = () => {
        setCurrentComponent(AVAILABLE_COMPONENTS.personalInfo);
        dispatch(resetEditObj());
        dispatch(resetPrevObj());
    };

    useEffect(() => {
        dispatch(setPrevObj({ key: "references", value: editObj.references }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="w-full">
            <div className="bg-white rounded-2xl w-full pt-6 pb-9 px-5 md:px-7 lg:px-9 relative max-w-full mt-4">
                <h1 className="text-xl font-bold mb-5">Create Reference</h1>

                <div>
                    <div>
                        <label htmlFor="reference_name" className="text-sm font-semibold">
                            Full name
                            <span className="gradient min-h-1 min-w-1 ml-[5px] mt-1 inline-block h-1 w-1 rounded-full align-top"></span>
                        </label>
                        <br />
                        <input
                            className="bg-gray-100 w-full rounded-md px-2 py-3 mb-2 mt-1"
                            type="text"
                            name="name"
                            id="reference_name"
                            value={editObj.references?.name || ""}
                            onChange={(e) => handleAddOrUpdateReference({ name: e.target.value || NULL_VALUE })}
                            placeholder="e.g. Jane Banda"
                        />
                    </div>
                    <div>
                        <label htmlFor="reference_job_title" className="text-sm font-semibold">
                            Role / relationship to you
                        </label>
                        <br />
                        <input
                            className="bg-gray-100 w-full rounded-md px-2 py-3 mb-2 mt-1"
                            type="text"
                            name="jobTitle"
                            id="reference_job_title"
                            value={editObj.references?.jobTitle || ""}
                            onChange={(e) => handleAddOrUpdateReference({ jobTitle: e.target.value || NULL_VALUE })}
                            placeholder="e.g. Former Supervisor"
                        />
                    </div>
                    <div>
                        <label htmlFor="reference_organization" className="text-sm font-semibold">
                            Organization
                        </label>
                        <br />
                        <input
                            className="bg-gray-100 w-full rounded-md px-2 py-3 mb-2 mt-1"
                            type="text"
                            name="organization"
                            id="reference_organization"
                            value={editObj.references?.organization || ""}
                            onChange={(e) => handleAddOrUpdateReference({ organization: e.target.value || NULL_VALUE })}
                            placeholder="e.g. Malawi Red Cross Society"
                        />
                    </div>
                    <div>
                        <label htmlFor="reference_email" className="text-sm font-semibold">
                            Email
                        </label>
                        <br />
                        <input
                            className="bg-gray-100 w-full rounded-md px-2 py-3 mb-2 mt-1"
                            type="email"
                            name="email"
                            id="reference_email"
                            value={editObj.references?.email || ""}
                            onChange={(e) => handleAddOrUpdateReference({ email: e.target.value || NULL_VALUE })}
                            placeholder="e.g. jane.banda@example.org"
                        />
                    </div>
                    <div>
                        <label htmlFor="reference_phone" className="text-sm font-semibold">
                            Phone
                        </label>
                        <br />
                        <input
                            className="bg-gray-100 w-full rounded-md px-2 py-3 mb-2 mt-1"
                            type="tel"
                            name="phone"
                            id="reference_phone"
                            value={editObj.references?.phone || ""}
                            onChange={(e) => handleAddOrUpdateReference({ phone: e.target.value || NULL_VALUE })}
                            placeholder="e.g. +265 991 000 111"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl w-full py-4 px-5 md:px-7 lg:px-9 relative max-w-full mt-4 flex justify-end items-center gap-6">
                <button className="font-bold" onClick={handleCancel}>
                    Cancel
                </button>
                <button
                    className="flex gradient border-none cursor-pointer appearance-none touch-manipulation items-center gap-4 outline-none shadow-md rounded-full font-extrabold hover:opacity-80 text-white bg-gradient-to-r from-brand-500 to-brand-700 py-3 px-[2rem]"
                    onClick={handleSave}
                >
                    <span className="flex items-center gap-2">
                        <BsCheck2 className="text-2xl" />
                        <span className="font-extralight text-xl">|</span>
                    </span>
                    Save
                </button>
            </div>
        </div>
    );
};

export default References;

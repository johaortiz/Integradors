"use client";
import { useState, ChangeEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Devices() {
    const [devices, setDevices] = useState<any[]>([]);
    const [newDevices, setNewDevices] = useState<any[]>([]);

    const fetchDevices = async () => {
        try {
            const response = await fetch('http://localhost:3001/devices');
            const data = await response.json();
            setDevices(data);
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };
    
    useEffect(() => {
        fetchDevices();
    }, []);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const { name, value } = e.target;
        const updatedDevices = [...newDevices];
        updatedDevices[index] = { ...updatedDevices[index], [name]: value };
        setNewDevices(updatedDevices);
    };

    const addNewDeviceForm = () => {
        setNewDevices([...newDevices, { host: '', name: '', username: '', password: '', frequency_minutes: 0, max_backup_limit: 0 }]);
    };

    const saveDevices = async () => {
        try {
            for (const device of newDevices) {
                const parsedDevice = {
                    host: device.host || '',
                    name: device.name || '',
                    username: device.username || '',
                    password: device.password || '',
                    frequency_minutes: new Number(device.frequency_minutes) || new Number(0),
                    max_backup_limit: new Number(device.max_backup_limit) || new Number(0),
                };
    
                await fetch('http://localhost:3001/devices', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(parsedDevice),
                });
            }
            fetchDevices();
            setNewDevices([]);
        } catch (error) {
            console.error('Error saving devices:', error);
        }
    };
    

    const router = useRouter();

    const removeDevice = async (index: number, isExisting: boolean) => {
        try {
            if (isExisting) {
                const device = devices[index];
                await fetch(`http://localhost:3001/devices/${device.id}`, {
                    method: 'DELETE',
                });
                setDevices(devices.filter((_, i) => i !== index));
            } else {
                setNewDevices(newDevices.filter((_, i) => i !== index));
            }
        } catch (error) {
            console.error('Error removing device:', error);
        }
    };

    const handleRowClick = (host: string, id: string) => {
        router.push(`/${host}/${id}`);
    };    

    console.log(devices);
    

    return (
        <div className="flex flex-col justify-center items-center w-full py-4 gap-y-12">
            <h3 className="text-2xl font-semibold">Lista de Dispositivos</h3>
            <div className="flex w-full overflow-x-auto px-20">
                <table className="table table-hover w-full">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Host</th>
                            <th>Nombre</th>
                            <th>Usuario</th>
                            <th>Contraseña</th>
                            <th>Frecuencia de Backups</th>
                            <th>Límite de Backups</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map((device, index) => (
                            <tr key={device.id}>
                                <td className='cursor-pointer' onClick={() => handleRowClick(device.host, device.id)}>{device.id}</td>
                                <td>{device.host}</td>
                                <td>{device.name}</td>
                                <td>{device.username}</td>
                                <td>{device.password}</td>
                                <td>{device.frequency_minutes} min</td>
                                <td>{device.max_backup_limit}</td>
                                <td className="text-center">
                                    <span
                                        onClick={() => removeDevice(index, true)}
                                        className="badge badge-outline-error badge-xs cursor-pointer hover:bg-red-700 hover:text-white duration-150"
                                    >
                                        X
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {newDevices.map((device, index) => (
                            <motion.tr
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <td>
                                    Autogenerado
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="host"
                                        value={device.host}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="border p-1 w-full rounded-lg"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="name"
                                        value={device.name}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="border p-1 w-full rounded-lg"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="username"
                                        value={device.username}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="border p-1 w-full rounded-lg"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="password"
                                        value={device.password}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="border p-1 w-full rounded-lg"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="frequency_minutes"
                                        value={device.frequency_minutes}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="border p-1 w-full rounded-lg"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="max_backup_limit"
                                        value={device.max_backup_limit}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="border p-1 w-full rounded-lg"
                                    />
                                </td>
                                <td className="text-center">
                                    <span
                                        onClick={() => removeDevice(index, false)}
                                        className="badge badge-outline-error badge-xs cursor-pointer hover:bg-red-700 hover:text-white duration-150"
                                    >
                                        X
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                        <tr>
                            <td colSpan={8} onClick={addNewDeviceForm} className="text-center cursor-pointer">
                                Añadir Nuevo Dispositivo
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {newDevices.length > 0 && (
                <div className="fixed bottom-4 right-4">
                    <button
                        onClick={saveDevices}
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-700 duration-150"
                    >
                        Guardar Dispositivos
                    </button>
                </div>
            )}
        </div>
    );
}

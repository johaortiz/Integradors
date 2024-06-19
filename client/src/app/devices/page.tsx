"use client";
import { useState, ChangeEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Devices() {
    const [devices, setDevices] = useState<any[]>([]);
    const [newDevices, setNewDevices] = useState<any[]>([]);

    const fetchDevices = async () => {
        try {
            const response = await fetch('http://localhost:3000/devices');
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
        setNewDevices([...newDevices, { host: '', ip: '', name: '', user: '', password: '', isConnected: false }]);
    };

    const saveDevices = async () => {
        try {
            for (const device of newDevices) {
                await fetch('http://localhost:3000/devices', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(device),
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
                await fetch(`http://localhost:3000/devices/${device.id}`, {
                    method: 'DELETE',
                });
                setDevices(devices.filter((_: any, i: any) => i !== index));
            } else {
                setNewDevices(newDevices.filter((_: any, i: any) => i !== index));
            }
        } catch (error) {
            console.error('Error removing device:', error);
        }
    };

    const toggleConnection = async (index: number, isExisting: boolean) => {
        const updatedDevices = isExisting ? [...devices] : [...newDevices];
        const device = updatedDevices[index];
        const action = device.isConnected ? 'disconnect' : 'connect';

        try {
            const response = await fetch(`/api/devices/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ host: device.host, ip: device.ip }),
            });

            if (response.ok) {
                updatedDevices[index] = { ...device, isConnected: !device.isConnected };
                if (isExisting) {
                    setDevices(updatedDevices);
                } else {
                    setNewDevices(updatedDevices);
                }
            }
        } catch (error) {
            console.error('Error toggling connection:', error);
        }
    };

    const handleRowClick = (host: string, id: string) => {
        router.push(`/${host}/${id}`);
    };

    return (
        <div className="flex flex-col justify-center items-center w-full py-4 gap-y-12">
            <h3 className="text-2xl font-semibold">Lista de Dispositivos</h3>
            <div className="flex w-full overflow-x-auto px-20">
                <table className="table table-hover w-full">
                    <thead>
                        <tr>
                            <th>Host</th>
                            <th>IP</th>
                            <th>Nombre</th>
                            <th>Usuario</th>
                            <th>Contraseña</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map((device: any, index: any) => (
                            <tr key={index} onClick={() => handleRowClick(device.host, device.id)}>
                                <td>{device.host}</td>
                                <td>{device.ip}</td>
                                <td>{device.name}</td>
                                <td>{device.user}</td>
                                <td>{device.password}</td>
                                <td>
                                    <button
                                        onClick={() => toggleConnection(index, true)}
                                        className={`p-1 rounded ${device.isConnected ? 'bg-red-500' : 'bg-green-500'} text-white`}
                                    >
                                        {device.isConnected ? 'Desconectar' : 'Conectar'}
                                    </button>
                                </td>
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
                        {newDevices.map((device: any, index: any) => (
                            <motion.tr
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
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
                                        name="ip"
                                        value={device.ip}
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
                                        name="user"
                                        value={device.user}
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
                                    <button
                                        onClick={() => toggleConnection(index, false)}
                                        className={`p-1 rounded ${device.isConnected ? 'bg-red-500' : 'bg-green-500'} text-white`}
                                    >
                                        {device.isConnected ? 'Desconectar' : 'Conectar'}
                                    </button>
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
                            <td colSpan={7} onClick={addNewDeviceForm} className="text-center cursor-pointer">
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

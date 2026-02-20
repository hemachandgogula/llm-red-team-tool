import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_project(client: AsyncClient, auth_headers: dict):
    response = await client.post(
        "/api/v1/projects",
        json={"name": "Test Project", "description": "A test project"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_projects(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/v1/projects",
        json={"name": "Project 1"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/projects",
        json={"name": "Project 2"},
        headers=auth_headers,
    )
    response = await client.get("/api/v1/projects", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.asyncio
async def test_get_project(client: AsyncClient, auth_headers: dict):
    create_resp = await client.post(
        "/api/v1/projects",
        json={"name": "Get Test Project"},
        headers=auth_headers,
    )
    project_id = create_resp.json()["id"]
    response = await client.get(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == project_id


@pytest.mark.asyncio
async def test_update_project(client: AsyncClient, auth_headers: dict):
    create_resp = await client.post(
        "/api/v1/projects",
        json={"name": "Old Name"},
        headers=auth_headers,
    )
    project_id = create_resp.json()["id"]
    response = await client.put(
        f"/api/v1/projects/{project_id}",
        json={"name": "New Name"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"


@pytest.mark.asyncio
async def test_delete_project(client: AsyncClient, auth_headers: dict):
    create_resp = await client.post(
        "/api/v1/projects",
        json={"name": "Delete Me"},
        headers=auth_headers,
    )
    project_id = create_resp.json()["id"]
    response = await client.delete(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert response.status_code == 204

    get_response = await client.get(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_project_not_found(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/projects/nonexistent", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_project_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/projects")
    assert response.status_code == 403

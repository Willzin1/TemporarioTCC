<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CardapioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): View
    {
        $token = session('api_token');
        $response = Http::withToken($token)->get(env('API_URL') . 'cardapio', [
            'page' => $request->get('page'),
            'search' => $request->get('search'),
            'filter' => $request->get('filter')
        ]);

        $prato = $response->json();
        $paginate = $prato['paginate'];
        $pratos = collect($prato['pratos']);

        if ($request->get('page') > $paginate['last_page']) {
            return view('errors.page404');
        }

        return view('pages.admin.cardapio.index', ['pratos' => $pratos, 'paginate' => $paginate]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        return view('pages.admin.cardapio.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $token = session('api_token');

        $multipart = [
            [
                'name' => 'nome',
                'contents' => $request->nome,
            ],
            [
                'name' => 'descricao',
                'contents' => $request->descricao,
            ],
            [
                'name' => 'categoria',
                'contents' => $request->categoria,
            ],
        ];

        if ($request->hasFile('imagem')) {
            $file = $request->file('imagem');
            $multipart[] = [
                'name' => 'imagem',
                'filename' => $file->getClientOriginalName(),
                'Mime-Type' => $file->getMimeType(),
                'contents' => fopen($file->getRealPath(), 'r'),
            ];
        }

        $response = Http::withToken($token)->asMultipart()->post(env('API_URL') . 'cardapio', $multipart);

        if ($response->successful()) {
            return redirect()->route('admin.cardapio.index')->with('success', $response['message']);
        }

        return redirect()->back()->with('error', $response['message']);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): View
    {
        $token = session('api_token');

        $response = Http::withToken($token)->get(env('API_URL') . "cardapio/{$id}");

        if ($response->successful()) {
            $prato = $response->json();

            return view('pages.admin.cardapio.edit', compact('prato'));
        }

        return view('errors.page404');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, String $id): RedirectResponse
    {
        $token = session('api_token');

        $multipart = [
            [
                'name' => '_method',
                'contents' => 'PUT',
            ],
            [
                'name' => 'nome',
                'contents' => $request->nome,
            ],
            [
                'name' => 'descricao',
                'contents' => $request->descricao,
            ],
            [
                'name' => 'categoria',
                'contents' => $request->categoria,
            ],
        ];

        if ($request->hasFile('imagem')) {
            $file = $request->file('imagem');
            $multipart[] = [
                'name' => 'imagem',
                'filename' => $file->getClientOriginalName(),
                'Mime-Type' => $file->getMimeType(),
                'contents' => fopen($file->getRealPath(), 'r'),
            ];
        }

        $response = Http::withToken($token)->asMultipart()->post(env('API_URL') . "cardapio/{$id}", $multipart);

        if($response->successful()) {
            return redirect()->route('admin.cardapio.index')->with('success', $response['message']);
        }

        return redirect()->back()->with('error', $response['message']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(String $id): RedirectResponse
    {
        $token = session('api_token');
        $response = Http::withToken($token)->delete(env('API_URL') . "cardapio/{$id}");

        if ($response->successful()) {
            return redirect()->route('admin.cardapio.index')->with('success', $response['message']);
        }

        return redirect()->back()->with('error', $response['message']);
    }
}

<?php

/*
 * This file is part of the SkreenHouseFactoryV3Bundle package.
 *
 * (c) Brickstorm <http://brickstorm.org/>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace SkreenHouseFactory\v3Bundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use SkreenHouseFactory\v3Bundle\Api\ApiManager;
use SkreenHouseFactory\v3Bundle\Controller\PersonController;

//les vrais inconnus
ini_set('post_max_size', '2048M');
ini_set('upload_max_filesize', '2048M');

class ChannelCustomController extends Controller
{
  //Les Inconnus - la chaîne
  protected function channel1($data){
    $response = $this->render('SkreenHouseFactoryV3Bundle:ChannelCustom:inconnus-chaine.html.twig', $data);

    $maxage = 300;
    $response->setPublic();
    $response->setMaxAge($maxage);
    $response->setSharedMaxAge($maxage);

    return $response;
  }
}

class ChannelController extends ChannelCustomController
{
  private function blockDomain(Request $request) {
    if ($this->get('kernel')->getEnvironment() == 'prod' && 
      !strstr($request->getHost(), 'www.myskreen.com') && 
      !strstr($request->getHost(), 'preprod-v3.myskreen.com') && 
      !strstr($request->getHost(), 'myskreen.') && 
      !strstr($request->getHost(), 'inconnus.') && 
      !strstr($request->getHost(), '.typhon.net')) {
      throw $this->createNotFoundException('Page does not exist');
    }
  }

  //Channel
  public function channelAction(Request $request)
  {
    $this->blockDomain($request);

    //hack seo
    if (in_array($request->get('slug'), array('tv-en-direct', 'track-js.php'))) {
      return $this->redirect('http://www.myskreen.com', 301);
    }

    $api   = $this->get('api');
    $params = array(
      'from_slug'  => $request->get('slug'),
      'channel_img_width' => 45,
      'img_width' => 150,
      'img_height' => 200,
      'offset' => $request->get('page', 1) * 30 - 30,
      'nb_results' => 30,
      'facets' => $this->buildFacets($request),
      'disable_search_by_format' => true,
      'sorter' => 'year',
      'preview' => $request->get('preview'),
      'fields' => 'description,programs,img_maxsize'
    );
    $data = $api->fetch('channel'.($request->get('id')?'/'.$request->get('id'):null), $params);

    $this->validateData($data, $request);

    // TO CHECK !
    //Si channel mais facet => view fournisseur
    if (property_exists($data, 'channel') && 
        property_exists($data->channel, 'fournisseur') && 
        ($request->get('format') || $request->get('facet'))) {
      $data = $data->channel->fournisseur;
      $data->description = null;
    }

    // view paramaters
    $params = array();
    if (isset($data->facets)) {
      $params = array(
        'formats' => array_combine(explode(';', $data->facets_seo_url->format),explode(';', $data->facets->format)),
        'categories' => array_combine(explode(';', $data->facets_seo_url->category),explode(';', $data->facets->category)),
        'subcategories' => array_combine(explode(';', $data->facets_seo_url->subcategory),explode(';', $data->facets->subcategory)),
        'access' => explode(';', isset($data->facets->access) ? $data->facets->access : null),
        'alpha_available' => explode(';', $data->facets->alpha),
        'alpha' => array(
          1,2,3,4,5,6,7,8,9,
          'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
        )
      );
    }

    //si Fournisseur
    if (!property_exists($data, 'channel')){
      return $this->fournisseurAction($data, $params, $request);
    }

    //si ChannelFournisseur
    if (property_exists($data, 'channel') && 
        $data->channel->type == 'ChannelFournisseur') {
      $data->channel->fournisseur = $data;
    }
    //si ChannelPersonne
    if (property_exists($data, 'channel') && 
        $data->channel->type == 'ChannelPersonne') {
      $params['formats'] = PersonController::getFormats((array)$data->programs);
    }

    //si ChannelCustom
    $method = 'channel'.$data->channel->id;
    if (method_exists($this, $method)) {
      return $this->$method($data);
    }

    if(isset($data->channel->fournisseur)){
      $data->channel->fournisseur = (object)array_merge($params, (array)$data->channel->fournisseur);
    }

    $params = array_merge($params, array(
      'data' => $data,
      'channel' => $data->channel
    ));

    if ($data->channel->type == 'ChannelFournisseur' ||
        property_exists($data->channel, 'fournisseur')) {
      $data->channel->fournisseur->formats = array_combine(explode(';', $data->channel->fournisseur->facets_seo_url->format),explode(';', $data->channel->fournisseur->facets->format));
      $data->channel->fournisseur->alpha_available = explode(';', $data->channel->fournisseur->facets->alpha);
      $data->channel->fournisseur->alpha = array(
        1,2,3,4,5,6,7,8,9,
        'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
      );
      unset($data->channel->fournisseur->facets);
      unset($data->channel->fournisseur->facets_seo_url);
    }

    $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:channel.html.twig', $params);

    $maxage = 60;
    $response->setPublic();
    $response->setMaxAge($maxage);
    $response->setSharedMaxAge($maxage);

    return $response;

  }

  // Fournisseur
  public function fournisseurAction($data, $params, Request $request)
  {
    $params = array_merge($params, array('channel' => $data));
    $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:fournisseur.html.twig', $params);

    $maxage = 300;
    $response->setPublic();
    $response->setMaxAge($maxage);
    $response->setSharedMaxAge($maxage);

    return $response;
  }

  protected function validateData($data, Request $request)
  {
    if (isset($data->error) && $data->error) {
      throw $this->createNotFoundException('Channel does not exist');
    }

    //redirect fournisseur synonyme
    if (isset($data->redirect) && $data->redirect) {
      return $this->redirect($data->redirect, 301);
    }

    //bad url
    if (!strstr($request->getPathInfo(), '/partners/') &&
              ($request->getPathInfo() != $data->seo_url &&
              $request->getPathInfo() != $data->seo_url . $request->get('format') . '/' &&
              $request->getPathInfo() != $data->seo_url . $request->get('format') . '/' . $request->get('facet') . '/' &&
              $request->getPathInfo() != $data->seo_url . $request->get('format') . '/' . $request->get('facet') .  '/page-' . $request->get('page') . '/' &&
              $request->getPathInfo() != $data->seo_url . 'page-' . $request->get('page') . '/' &&
              $request->getPathInfo() != $data->seo_url . $request->get('facet') . '/') &&
              (!property_exists($data,'channel') || str_replace('/','',$request->getPathInfo()) != $data->channel->slug)) {
      if ($this->container->getParameter('kernel.environment') == 'dev') {
        echo "\n".'pathInfo: ' . $request->getPathInfo();
        echo "\n".'----';
        echo "\n".'facet: ' . $data->seo_url . $request->get('facet') . '/';
        echo "\n".'format: ' . $data->seo_url . $request->get('format') . '/';
        echo "\n".'format+cat: ' . $data->seo_url . $request->get('format') . '/' . $request->get('facet') . '/' ;
        echo "\n".'format+cat+page: ' . $data->seo_url . $request->get('format') . '/' . $request->get('facet') .  '/page-' . $request->get('page') . '/';
        echo "\n".'page: ' . $data->seo_url . 'page-' . $request->get('page') . '/';
        echo "\n".'default '.$request->getPathInfo().' != '.$data->seo_url.' => '.($request->getPathInfo() != $data->seo_url);
        echo "\n".'redirect '.$data->seo_url;
        exit();
      }
      return $this->redirect($data->seo_url, 301);
    }

    if (isset($data->channel) && $request->get('slug') != $data->channel->slug) {
      // Alias du channel fourni
      return $this->redirect('/' . $data->channel->slug, 301);
    }

  }

  protected function buildFacets(Request $request) {

    $facets = array();
    if (strlen($request->get('facet')) == 1) {
      $facets[] = 'alpha:' . $request->get('facet');
    } elseif (in_array($request->get('facet'), array('video-a-la-demande', 'cinema'))) {
      $facets[] = 'access:' . str_replace(array('video-a-la-demande'), array('vod'), $request->get('facet'));
    } elseif ($request->get('facet')) {
      if (in_array($request->get('_route'), array('channel_format_facet', 'channel_format_facet_page'))) {
        $facets[] = 'category:' . $request->get('facet');
      } else {
        $facets[] = 'subcategory:' . $request->get('facet');
      }
    }
    if ($request->get('format')) {
      $facets[] = 'format:' . $request->get('format');
    }
    if ($request->get('access')) {
      $facets[] = 'access:' . str_replace(
        array('video-a-la-demande', 'tv', 'replay', 'cinema', 'dvd'), 
        array('vod', 'tv', 'catchup', 'cinema', 'dvd'), 
        $request->get('access')
      );
    }
    return implode(',', $facets);
  }

}